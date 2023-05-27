import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable";
import { UUID } from "./Common/UUID";
import { GetListQuery } from "./Query";

const JpgType = t.literal("image/jpg");
const JpegType = t.literal("image/jpeg");
const PngType = t.literal("image/png");

/** audio types */
export const MP3Type = t.literal("audio/mp3");
export type MP3Type = t.TypeOf<typeof MP3Type>;
export const OGGType = t.literal("audio/ogg");
export type OGGType = t.TypeOf<typeof OGGType>;

export const MP4Type = t.literal("video/mp4");
export type MP4Type = t.TypeOf<typeof MP4Type>;
export const PDFType = t.literal("application/pdf");
export type PDFType = t.TypeOf<typeof PDFType>;
export const IframeVideoType = t.literal("iframe/video");
export type IframeVideoType = t.TypeOf<typeof IframeVideoType>;

export const MediaType = t.union(
  [
    JpgType,
    JpegType,
    PngType,
    MP3Type,
    OGGType,
    MP4Type,
    PDFType,
    IframeVideoType,
  ],
  "MediaType"
);
export type MediaType = t.TypeOf<typeof MediaType>;

export const ImageType = t.union([JpgType, JpegType, PngType], "ImageType");

export type ImageType = t.TypeOf<typeof ImageType>;

export const ValidContentType = t.union([
  MediaType.types[0],
  MediaType.types[1],
  MediaType.types[2],
  MediaType.types[3],
  MediaType.types[4],
  MediaType.types[5],
  MediaType.types[6],
]);
export type ValidContentType = t.TypeOf<typeof ValidContentType>;

export const GetListMediaQuery = t.type(
  {
    ...GetListQuery.props,
    type: optionFromNullable(t.union([t.array(MediaType), t.string])),
    events: optionFromNullable(t.array(UUID)),
    ids: optionFromNullable(t.array(UUID)),
    exclude: optionFromNullable(t.array(UUID)),
    description: optionFromNullable(t.string),
    emptyEvents: optionFromNullable(BooleanFromString),
    emptyLinks: optionFromNullable(BooleanFromString),
    deletedOnly: optionFromNullable(BooleanFromString),
    creator: optionFromNullable(UUID),
    keywords: optionFromNullable(t.array(UUID)),
  },
  "MediaListQuery"
);
export type GetListMediaQuery = t.TypeOf<typeof GetListMediaQuery>;

export const CreateMedia = t.strict(
  {
    location: t.string,
    description: t.string,
    thumbnail: t.union([t.string, t.undefined]),
    type: ValidContentType,
  },
  "CreateMedia"
);

export type CreateMedia = t.TypeOf<typeof CreateMedia>;

export const Media = t.strict(
  {
    id: UUID,
    type: MediaType,
    thumbnail: t.union([t.string, t.undefined]),
    description: t.string,
    location: t.string,
    creator: t.union([UUID, t.undefined]),
    events: t.array(UUID),
    links: t.array(UUID),
    keywords: t.array(UUID),
    featuredIn: t.union([t.array(UUID), t.undefined]),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    deletedAt: t.union([DateFromISOString, t.undefined]),
  },
  "Media"
);
export type Media = t.TypeOf<typeof Media>;
