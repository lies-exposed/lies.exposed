import { Position } from "@liexp/shared/lib/io/http/Common/Geometry/Position.js";
import { type Area } from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect/index";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useDataProvider } from "../../../../hooks/useDataProvider.js";
import { CircularProgress, Stack, TextField } from "../../../mui/index.js";
import { Button, useRecordContext, useRefresh } from "../../react-admin.js";

export const UpdateAreaGeometryWithCoordinatesButton: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext<Area.Area>();
  const [coords, setQuery] = React.useState<Position | undefined>(
    record?.geometry.coordinates as Position | undefined,
  );

  const apiProvider = useDataProvider();

  const searchForCoordinates = React.useCallback(
    (area: Area.Area, coords: Position | undefined) => {
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
          pipe(
            e.target.value.split(",").map((n) => parseFloat(n)),
            Schema.encodeUnknownSync(Position),
            setQuery,
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
