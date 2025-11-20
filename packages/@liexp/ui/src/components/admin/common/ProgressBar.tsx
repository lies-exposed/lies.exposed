import { type AxiosProgressEvent } from "axios";
import * as React from "react";
import { LinearProgress } from "../../mui/index.js";

export const ProgressBar: React.FC<{
  progress: AxiosProgressEvent;
}> = ({ progress }) => {
  const variant = progress.progress ? "determinate" : "indeterminate";
  const value = progress.progress ? (progress.progress * 100) : 0;
  return <LinearProgress value={value} variant={variant} />;
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
