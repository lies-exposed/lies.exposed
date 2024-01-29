import * as t from "io-ts";
import { BooleanFromString } from "io-ts-types/lib/BooleanFromString.js";
import { DateFromISOString } from "io-ts-types/lib/DateFromISOString.js";
import { NumberFromString } from "io-ts-types/lib/NumberFromString.js";
import { optionFromNullable } from "io-ts-types/lib/optionFromNullable.js";
import { UUID } from "./Common/UUID.js";
import { GetListQuery } from "./Query/index.js";

export const MEDIA = t.literal("media");
export type MEDIA = t.TypeOf<typeof MEDIA>;

const JpgType = t.literal("image/jpg");
type JpgType = t.TypeOf<typeof JpgType>;
const JpegType = t.literal("image/jpeg");
type JpegType = t.TypeOf<typeof JpegType>;
export const PngType = t.literal("image/png");
export type PngType = t.TypeOf<typeof PngType>;

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
  "MediaType",
);
export type MediaType = t.TypeOf<typeof MediaType>;

export const ImageType = t.union([JpgType, JpegType, PngType], "ImageType");
export type ImageType = t.TypeOf<typeof ImageType>;
export const AudioType = t.union([OGGType, MP3Type], "AudioType");
export type AudioType = t.TypeOf<typeof AudioType>;

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
    emptyThumbnail: optionFromNullable(BooleanFromString),
    emptyEvents: optionFromNullable(BooleanFromString),
    emptyLinks: optionFromNullable(BooleanFromString),
    emptyAreas: optionFromNullable(BooleanFromString),
    deletedOnly: optionFromNullable(BooleanFromString),
    creator: optionFromNullable(UUID),
    keywords: optionFromNullable(t.array(UUID)),
    spCount: optionFromNullable(NumberFromString),
    onlyUnshared: optionFromNullable(BooleanFromString),
  },
  "MediaListQuery",
);
export type GetListMediaQuery = t.TypeOf<typeof GetListMediaQuery>;

export const ThumbnailsExtraError = t.strict(
  {
    error: t.string,
  },
  "ThumbnailError",
);
export type ThumbnailsExtraError = t.TypeOf<typeof ThumbnailsExtraError>;

export const ThumbnailsExtraLocations = t.array(t.string, "Thumbnails");
export type ThumbnailsExtraLocations = t.TypeOf<typeof ThumbnailsExtraLocations>;

export const ThumbnailsExtra = t.strict(
  {
    thumbnails: t.union([ThumbnailsExtraError, ThumbnailsExtraLocations]),
  },
  "ThumbnailsExtra",
);
export type ThumbnailsExtra = t.TypeOf<typeof ThumbnailsExtra>;

export const TimeExtra = t.strict(
  {
    duration: t.number,
  },
  "TimeExtra",
);
export type TimeExtra = t.TypeOf<typeof TimeExtra>;

export const VideoExtra = t.strict(
  {
    ...TimeExtra.type.props,
    thumbnails: t.union([ThumbnailsExtraError, ThumbnailsExtraLocations, t.undefined])
  },
  "VideoExtra",
);
export type VideoExtra = t.TypeOf<typeof VideoExtra>;

export const MediaExtra = t.union(
  [ThumbnailsExtra, VideoExtra, t.undefined],
  "MediaExtra",
);
export type MediaExtra = t.TypeOf<typeof MediaExtra>;

export const CreateMedia = t.strict(
  {
    location: t.string,
    label: t.union([t.string, t.undefined]),
    description: t.union([t.string, t.undefined]),
    thumbnail: t.union([t.string, t.undefined]),
    extra: MediaExtra,
    type: MediaType,
    events: t.array(UUID),
    links: t.array(UUID),
    keywords: t.array(UUID),
    areas: t.array(UUID),
  },
  "CreateMedia",
);

export type CreateMedia = t.TypeOf<typeof CreateMedia>;

export const Media = t.strict(
  {
    ...CreateMedia.type.props,
    id: UUID,
    type: MediaType,
    creator: t.union([UUID, t.undefined]),
    featuredIn: t.union([t.array(UUID), t.undefined]),
    socialPosts: t.union([t.array(UUID), t.undefined]),
    createdAt: DateFromISOString,
    updatedAt: DateFromISOString,
    deletedAt: t.union([DateFromISOString, t.undefined]),
  },
  "Media",
);
export type Media = t.TypeOf<typeof Media>;

export type ImageMedia = Omit<Media, "type"> & { type: ImageType };

export const AdminMedia = t.intersection(
  [Media, t.strict({ transferable: t.boolean })],
  "AdminMedia",
);
export type AdminMedia = t.TypeOf<typeof AdminMedia>;
