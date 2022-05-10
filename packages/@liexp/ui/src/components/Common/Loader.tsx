import CircularProgress from "@mui/material/CircularProgress";
import * as React from "react";

export const Loader: () => React.ReactElement = () => {
  return <CircularProgress />;
};

export const LazyLoader = (): React.ReactElement<any, any> => <Loader />;
