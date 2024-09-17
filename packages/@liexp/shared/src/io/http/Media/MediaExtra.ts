import * as t from "io-ts";

export const ThumbnailsExtraError = t.strict(
  {
    error: t.string,
  },
  "ThumbnailError",
);
export type ThumbnailsExtraError = t.TypeOf<typeof ThumbnailsExtraError>;

export const ThumbnailsExtraLocations = t.array(t.string, "Thumbnails");
export type ThumbnailsExtraLocations = t.TypeOf<
  typeof ThumbnailsExtraLocations
>;

export const ThumbnailsExtra = t.strict(
  {
    thumbnails: t.union([ThumbnailsExtraError, ThumbnailsExtraLocations]),
  },
  "ThumbnailsExtra",
);
export type ThumbnailsExtra = t.TypeOf<typeof ThumbnailsExtra>;

export const ImageMediaExtra = t.strict(
  {
    ...ThumbnailsExtra.type.props,
  },
  "ImageMediaExtra",
);
export type ImageMediaExtra = t.TypeOf<typeof ImageMediaExtra>;

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
    thumbnails: t.union([
      ThumbnailsExtraError,
      ThumbnailsExtraLocations,
      t.undefined,
    ]),
  },
  "VideoExtra",
);
export type VideoExtra = t.TypeOf<typeof VideoExtra>;

export const MediaExtra = t.union(
  [ImageMediaExtra, VideoExtra, t.undefined],
  "MediaExtra",
);
export type MediaExtra = t.TypeOf<typeof MediaExtra>;
