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
  const record = useRecordContext();
  const refresh = useRefresh();
  const apiProvider = useDataProvider();
  return (
    <Button
      label="Import from links"
      onClick={() => {
        void apiProvider
          .getList("links", {
            filter: { events: [record?.id] },
            pagination: { perPage: 5, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
          })
          .then((results) => {
            const media = results.data
              .filter((r) => !!r.image)
              .map((r) => r.image.id);
            const source = get(record, _source) ?? [];
            const data = set(record, _source, source.concat(media));
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
