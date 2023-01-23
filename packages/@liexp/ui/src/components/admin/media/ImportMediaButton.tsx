import { get, set } from "lodash";
import * as React from "react";
import { useDataProvider, useRecordContext, useRefresh } from "react-admin";
import { Button } from "../../mui";

export const ImportMediaButton: React.FC<{ source?: string, reference?: 'events'| 'events/suggestions' }> = ({
  source: _source = "media",
  reference = 'events'
}) => {
  const record = useRecordContext();
  const refresh = useRefresh();
  const apiProvider = useDataProvider();
  return (
    <Button
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
    >
      Import from links
    </Button>
  );
};
