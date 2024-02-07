import { type Area } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { CircularProgress, Stack, TextField } from "../../../mui/index.js";
import {
  Button,
  useDataProvider,
  useRecordContext,
  useRefresh,
} from "../../react-admin.js";

export const SearchAreaCoordinatesButton: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext<Area.Area>();
  const [query, setQuery] = React.useState(record.label ?? "");

  const apiProvider = useDataProvider();

  const searchForCoordinates = React.useCallback(() => {
    void apiProvider
      .create(`/admins/areas/${record.id}/search-coordinates`, {
        data: { label: query },
      })
      .then(({ data: { id, ...geom } }) => {
        return apiProvider.update("areas", {
          id: record.id,
          data: { ...record, geometry: geom },
          previousData: record,
        });
      })
      .then(() => {
        refresh();
      });
  }, [record.label]);

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
        label="Search for coordinates"
        onClick={searchForCoordinates}
        size="small"
        variant="outlined"
      />
    </Stack>
  );
};
