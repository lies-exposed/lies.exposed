import * as t from "io-ts"
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable"

export const ImageFileNode = t.interface(
  {
    publicURL: t.string,
    childImageSharp: t.interface(
      {
        fluid: t.interface({
          src: t.string,
          srcSet: t.string,
          sizes: t.string,
          base64: t.union([t.undefined, t.string]),
          tracedSVG: t.union([t.undefined, t.string]),
          srcWebp: t.union([t.undefined, t.string]),
          srcSetWebp: t.union([t.undefined, t.string]),
          media: t.union([t.undefined, t.string]),
          aspectRatio: t.number,
        }),
      },
      "ImageSharp"
    ),
  },
  "ImageFileNode"
)

export type ImageFileNode = t.TypeOf<typeof ImageFileNode>

export const ImageAndDescription = t.strict(
  {
    description: optionFromNullable(t.string),
    image: ImageFileNode,
  },
  "ImageAndDescription"
)

export type ImageAndDescription = t.TypeOf<typeof ImageAndDescription>
