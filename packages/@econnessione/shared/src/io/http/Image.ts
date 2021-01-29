import * as t from "io-ts";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";

// export const ImageFileNode = t.strict(
//   {
//     publicURL: t.string,
//     childImageSharp: t.strict(
//       {
//         fluid: t.strict({
//           src: t.string,
//           srcSet: t.string,
//           sizes: t.string,
//           base64: t.union([t.undefined, t.string]),
//           tracedSVG: t.union([t.undefined, t.string]),
//           srcWebp: t.union([t.undefined, t.string]),
//           srcSetWebp: t.union([t.undefined, t.string]),
//           media: t.union([t.undefined, t.string]),
//           aspectRatio: t.number,
//         }),
//       },
//       "ImageSharp"
//     ),
//   },
//   "ImageFileNode"
// )

export const ImageFileNode = t.string;

export type ImageFileNode = t.TypeOf<typeof ImageFileNode>;

export const ImageSource = t.strict(
  {
    author: t.string,
    description: optionFromNullable(t.string),
    image: ImageFileNode,
  },
  "ImageSource"
);

export type ImageSource = t.TypeOf<typeof ImageSource>;
