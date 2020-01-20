import * as t from "io-ts"

export const ImageFileNode = t.interface(
  {
    childImageSharp: t.interface({
      fixed: t.interface({
        src: t.string,
      }),
    }),
    relativeDirectory: t.string,
    relativePath: t.string,
    name: t.string,
    ext: t.string
  },
  "ImageFileNode"
)

export type ImageFileNode = t.TypeOf<typeof ImageFileNode>
