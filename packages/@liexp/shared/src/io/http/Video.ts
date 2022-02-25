import * as t from "io-ts";

export const VideoFileNode = t.interface(
  {
    publicURL: t.string,
    extension: t.string,
  },
  "VideoFileNode"
);

export type VideoFileNode = t.TypeOf<typeof VideoFileNode>;
