import { Schema } from "effect";

const JpgType = Schema.Literal("image/jpg");
type JpgType = typeof JpgType.Type;
const JpegType = Schema.Literal("image/jpeg");
type JpegType = typeof JpegType.Type;
export const PngType = Schema.Literal("image/png");
export type PngType = typeof PngType.Type;

/** audio types */
export const MP3Type = Schema.Literal("audio/mp3");
export type MP3Type = typeof MP3Type.Type;
export const OGGType = Schema.Literal("audio/ogg");
export type OGGType = typeof OGGType.Type;

export const MP4Type = Schema.Literal("video/mp4");
export type MP4Type = typeof MP4Type.Type;
export const PDFType = Schema.Literal("application/pdf");
export type PDFType = typeof PDFType.Type;
export const IframeVideoType = Schema.Literal("iframe/video");
export type IframeVideoType = typeof IframeVideoType.Type;

export const MediaType = Schema.Union(
  JpgType,
  JpegType,
  PngType,
  MP3Type,
  OGGType,
  MP4Type,
  PDFType,
  IframeVideoType,
).annotations({
  title: "MediaType",
});
export type MediaType = typeof MediaType.Type;

export const ImageType = Schema.Union(JpgType, JpegType, PngType).annotations({
  title: "ImageType",
});
export type ImageType = typeof ImageType.Type;
export const AudioType = Schema.Union(OGGType, MP3Type).annotations({
  title: "AudioType",
});
export type AudioType = typeof AudioType.Type;

export const ValidContentType = Schema.Union(
  MediaType.members[0],
  MediaType.members[1],
  MediaType.members[2],
  MediaType.members[3],
  MediaType.members[4],
  MediaType.members[5],
  MediaType.members[6],
).annotations({
  title: "ValidContentType",
});
export type ValidContentType = typeof ValidContentType.Type;

export const TransferableType = Schema.Union(
  ImageType,
  AudioType,
  MP3Type,
  MP4Type,
  PDFType,
).annotations({
  title: "TransferableType",
});
export type TransferableType = typeof TransferableType.Type;
