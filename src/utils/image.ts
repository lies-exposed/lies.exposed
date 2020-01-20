import * as t from "io-ts"

export const ImageNode = t.interface(
  {
    relativeDirectory: t.string,
    name: t.string,
    ext: t.string,
    childImageSharp: t.interface({
      fluid: t.interface({
        src: t.string,
      }),
    }),
  },
  "ImageNode"
)

export type ImageNode = t.TypeOf<typeof ImageNode>