import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { UUID } from "./Common/UUID";

const JpgType = t.literal("image/jpg");
const JpegType = t.literal("image/jpeg");
const PngType = t.literal("image/png");
const Mp4Type = t.literal("video/mp4");
const PdfType = t.literal("application/pdf");
const IframeVideoType = t.literal("iframe/video");

export const MediaType = t.union(
  [JpgType, JpegType, PngType, Mp4Type, PdfType, IframeVideoType],
  "MediaType"
);
export type MediaType = t.TypeOf<typeof MediaType>;

export const ImageType = t.union([JpgType, JpegType, PngType], "ImageType");

export type ImageType = t.TypeOf<typeof ImageType>;

export const Media = t.strict(
  {
    id: UUID,
    type: MediaType,
    thumbnail: t.union([t.string, t.undefined]),
    description: t.string,
    location: t.string,
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
  },
  "Media"
);
export type Media = t.TypeOf<typeof Media>;
