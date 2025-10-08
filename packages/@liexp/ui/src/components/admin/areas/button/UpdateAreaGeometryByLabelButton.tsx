import { type Area } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { CircularProgress, Stack, TextField } from "../../../mui/index.js";
import {
  Button,
  useDataProvider,
  useRecordContext,
  useRefresh,
} from "../../react-admin.js";

export const UpdateAreaGeometryByLabelButton: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext<Area.Area>();
  const [query, setQuery] = React.useState(record?.label ?? "");

  const apiProvider = useDataProvider();

  const searchForCoordinates = React.useCallback(
    (area: Area.Area) => {
      void apiProvider
        .create(`/admins/areas/${area.id}/search-coordinates`, {
          data: { label: query },
        })
        .then(({ data: { id: _id, ...geom } }) => {
          return apiProvider.update("areas", {
            id: area.id,
            data: { ...area, geometry: geom },
            previousData: area,
          });
        })
        .then(() => {
          refresh();
        });
    },
    [record?.label, query],
  );

  if (!record) {
    return <CircularProgress />;
  }

  return (
    <Stack
      direction={"row"}
      spacing={2}
      alignItems={"center"}
      justifyContent={"center"}
    >
      <TextField
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
        }}
        size="small"
      />
      <Button
        label="Search for coordinates by label"
        onClick={() => searchForCoordinates(record)}
        size="small"
        variant="outlined"
      />
    </Stack>
  );
};
