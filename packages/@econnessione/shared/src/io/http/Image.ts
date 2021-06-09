import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";
import { UUID } from "./Common/UUID";

export const Image = t.strict(
  {
    id: UUID,
    description: t.string,
    location: t.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "Image"
);
export type Image = t.TypeOf<typeof Image>;

export const ImageSource = t.strict(
  {
    description: t.string,
    location: t.string,
  },
  "ImageSource"
);

export type ImageSource = t.TypeOf<typeof ImageSource>;
