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

export const ImportMediaButton: React.FC<{
  source?: string;
  reference?: "events" | "events/suggestions";
}> = ({ source: _source = "media", reference = "events" }) => {
  const record = useRecordContext<Events.Event>();
  const refresh = useRefresh();
  const apiProvider = useDataProvider();

  const handleMediaImport = React.useCallback(
    (reference: string, event: Events.Event) => {
      void apiProvider
        .getList("links", {
          filter: { events: [event?.id] },
          pagination: { perPage: 5, page: 1 },
          sort: { field: "createdAt", order: "DESC" },
        })
        .then((results) => {
          const media = results.data
            .filter((r) => !!r.image)
            .map((r) => r.image.id);
          const source = get(event, _source) ?? [];
          const data = set(event, _source, source.concat(media));
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
    [apiProvider, refresh, _source, reference],
  );

  return (
    reference &&
    record && (
      <Button
        label="Import from links"
        onClick={() => handleMediaImport(reference, record)}
      />
    )
  );
};
