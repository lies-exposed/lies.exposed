import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "./Common/UUID";

const JpgType = t.literal("image/jpg");
const PngType = t.literal("image/png");
const Mp4Type = t.literal("video/mp4");
const PdfType = t.literal("application/pdf");

export const MediaType = t.union(
  [JpgType, PngType, Mp4Type, PdfType],
  "MediaType"
);
export type MediaType = t.TypeOf<typeof MediaType>;

export const Media = t.strict(
  {
    id: UUID,
    type: MediaType,
    description: t.string,
    location: t.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "Media"
);
export type Media = t.TypeOf<typeof Media>;

export const ImageSource = t.strict(
  {
    description: t.string,
    location: t.string,
  },
  "ImageSource"
);

export type ImageSource = t.TypeOf<typeof ImageSource>;
