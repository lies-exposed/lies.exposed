import { Schema } from "effect";

export const VideoFileNode = Schema.Struct({
  publicURL: Schema.String,
  extension: Schema.String,
}).annotations({
  title: "VideoFileNode",
});

export type VideoFileNode = typeof VideoFileNode.Type;
