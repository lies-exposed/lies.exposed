import { type Area } from "@liexp/shared/lib/io/http/index.js";
import * as React from "react";
import { CircularProgress } from "../../../mui/index.js";
import {
  Button,
  useDataProvider,
  useRecordContext,
  useRefresh,
} from "../../react-admin.js";

export const SearchAreaCoordinatesButton: React.FC = () => {
  const refresh = useRefresh();
  const record = useRecordContext<Area.Area>();

  const apiProvider = useDataProvider();

  const searchForCoordinates = React.useCallback(() => {
    void apiProvider
      .create(`/admins/areas/${record.id}/search-coordinates`, {
        data: { label: record.label },
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
    <Button label="Seearch for coordinates" onClick={searchForCoordinates} />
  );
};
