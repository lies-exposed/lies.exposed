import { Button } from "@mui/material";
import { useRecordContext, useRefresh } from "ra-core";
import * as React from "react";
import { apiProvider } from "../../client/HTTPAPI";

export const ImportMediaButton: React.FC = () => {
  const record = useRecordContext();
  const refresh = useRefresh();
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
            return apiProvider
              .update("events", {
                id: record.id,
                previousData: record,
                data: { ...record, media: record.media.concat(media) },
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
