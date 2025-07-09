import { type AxiosProgressEvent } from "axios";
import * as React from "react";
import { LinearProgress } from "../../mui/index.js";

export const ProgressBar: React.FC<{
  progress: AxiosProgressEvent;
}> = ({ progress }) => {
  const variant = progress.progress ? "determinate" : "indeterminate";
  return <LinearProgress value={progress.progress ?? 0} variant={variant} />;
};

export const useProgressBar = () => {
  const [progress, setProgress] = React.useState<AxiosProgressEvent | null>(
    null,
  );

  return {
    onUploadProgress: (p: AxiosProgressEvent) => {
      setProgress(p);
    },
    bar: progress ? <ProgressBar progress={progress} /> : null,
  };
};
