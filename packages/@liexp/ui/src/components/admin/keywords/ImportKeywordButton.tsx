import { type Events } from "@liexp/shared/lib/io/http/index.js";
import get from "lodash/get";
import set from "lodash/set";
import * as React from "react";
import {
  useDataProvider,
  useRecordContext,
  useRefresh,
  Button,
} from "react-admin";

export const ImportKeywordButton: React.FC<{
  source?: string;
  reference?: "events" | "events/suggestions";
}> = ({ source = "media", reference = "events" }) => {
  const record = useRecordContext<Events.Event>();
  const refresh = useRefresh();
  const apiProvider = useDataProvider();

  const handleKeywordImport = React.useCallback(
    (event: Events.Event) => {
      void apiProvider
        .getList("links", {
          filter: { events: [event?.id] },
          pagination: { perPage: 5, page: 1 },
          sort: { field: "createdAt", order: "DESC" },
        })
        .then((results) => {
          const media = results.data
            .reduce((acc, c) => acc.concat(c.data), [])
            .map((r: any) => r.id);
          const currentSource = get(event, source) ?? [];
          const data = set(event, source, currentSource.concat(media));
          return apiProvider
            .update(reference, {
              id: event.id,
              previousData: event,
              data,
            })
            .then(() => {
              refresh();
            });
        });
    },
    [apiProvider, refresh],
  );

  return (
    record && (
      <Button
        label={`Import from ${source}`}
        variant="contained"
        onClick={() => {
          handleKeywordImport(record);
        }}
      />
    )
  );
};
