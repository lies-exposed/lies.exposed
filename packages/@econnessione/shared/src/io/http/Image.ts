import * as t from "io-ts";

export const ImageSource = t.strict(
  {
    description: t.union([t.null, t.string]),
    location: t.string,
  },
  "ImageSource"
);

export type ImageSource = t.TypeOf<typeof ImageSource>;
