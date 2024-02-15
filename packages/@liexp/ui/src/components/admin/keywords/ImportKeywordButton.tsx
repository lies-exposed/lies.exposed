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
  const record = useRecordContext();
  const refresh = useRefresh();
  const apiProvider = useDataProvider();
  return (
    <Button
      label={`Import from ${source}`}
      onClick={() => {
        void apiProvider
          .getList("links", {
            filter: { events: [record?.id] },
            pagination: { perPage: 5, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
          })
          .then((results) => {
            const media = results.data
              .reduce((acc, c) => acc.concat(c.data), [])
              .map((r: any) => r.id);
            const currentSource = get(record, source) ?? [];
            const data = set(record, source, currentSource.concat(media));
            return apiProvider
              .update(reference, {
                id: record.id,
                previousData: record,
                data,
              })
              .then(() => {
                refresh();
              });
          });
      }}
    />
  );
};
