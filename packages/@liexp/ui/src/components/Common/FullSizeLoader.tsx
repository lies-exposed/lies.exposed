import { ParentSize } from "@visx/responsive";
import * as React from "react";
import { CircularProgress } from "../mui/index.js";

export const FullSizeLoader: React.FC<any> = () => {
  return (
    <ParentSize style={{ minHeight: "60%" }}>
      {({ width, height }) => {
        return (
          <div
            style={{
              height,
              width,
              textAlign: "center",
              minHeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CircularProgress />
          </div>
        );
      }}
    </ParentSize>
  );
};

export const LazyFullSizeLoader = (): React.ReactElement<any, any> => (
  <FullSizeLoader />
);
