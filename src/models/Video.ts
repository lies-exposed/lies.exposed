import * as t from "io-ts"

const VideoFileNode = t.interface(
  {
    publicURL: t.string,
    extension: t.string,
  },
  "VideoFileNode"
)

type VideoFileNode = t.TypeOf<typeof VideoFileNode>

export { VideoFileNode }