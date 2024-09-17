import * as t from "io-ts";

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
