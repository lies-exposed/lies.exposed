import CircularProgress from "@material-ui/core/CircularProgress";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import * as React from "react";

export const FullSizeLoader: React.FC<any> = () => {
  return (
    <ParentSize>
      {({ width, height }) => {
        return (
          <div style={{ height, width }}>
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
