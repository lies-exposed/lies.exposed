import { type Area } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { useDataProvider } from "../../../../hooks/useDataProvider.js";
import { CircularProgress, Stack, TextField } from "../../../mui/index.js";
import { Button, useRecordContext, useRefresh } from "../../react-admin.js";

export const UpdateAreaGeometryWithCoordinatesButton: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext<Area.Area>();
  const [coords, setQuery] = React.useState(record?.geometry.coordinates);

  const apiProvider = useDataProvider();

  const searchForCoordinates = React.useCallback(
    (area: Area.Area, coords: any) => {
      void apiProvider
        .update<Area.Area>("areas", {
          id: area.id,
          previousData: area,
          data: {
            ...area,
            featuredImage: area.featuredImage?.id,
            geometry: { type: "Point", coordinates: coords },
          },
        })
        .then(() => {
          refresh();
        });
    },
    [apiProvider],
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
        value={coords}
        onChange={(e) => {
          setQuery(
            e.target.value.split(",").map((n) => parseFloat(n)) as any[],
          );
        }}
        size="small"
      />
      <Button
        label="Search by coordinates"
        onClick={() => searchForCoordinates(record, coords)}
        size="small"
        variant="contained"
      />
    </Stack>
  );
};
