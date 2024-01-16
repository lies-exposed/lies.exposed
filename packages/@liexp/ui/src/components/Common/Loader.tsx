import * as React from "react";
import { CircularProgress } from "../mui/index.js";

export const Loader: () => React.ReactElement = () => {
  return <CircularProgress />;
};

export const LazyLoader = (): React.ReactElement<any, any> => <Loader />;
