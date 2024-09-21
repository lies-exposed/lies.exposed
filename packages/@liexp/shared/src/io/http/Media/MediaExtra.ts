import { type Monoid } from "fp-ts/lib/Monoid";
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
    thumbnailWidth: t.number,
    thumbnailHeight: t.number,
    thumbnails: t.union([ThumbnailsExtraError, ThumbnailsExtraLocations]),
    needRegenerateThumbnail: t.boolean,
  },
  "ThumbnailsExtra",
);
export type ThumbnailsExtra = t.TypeOf<typeof ThumbnailsExtra>;

export const ThumbnailsExtraMonoid: Monoid<ThumbnailsExtra> = {
  empty: {
    thumbnailWidth: 0,
    thumbnailHeight: 0,
    needRegenerateThumbnail: true,
    thumbnails: [],
  },
  concat: (x, y) => ({ ...x, ...y }),
};

export const ImageMediaExtra = t.strict(
  {
    ...ThumbnailsExtra.type.props,
    width: t.number,
    height: t.number,
  },
  "ImageMediaExtra",
);
export type ImageMediaExtra = t.TypeOf<typeof ImageMediaExtra>;

export const ImageMediaExtraMonoid: Monoid<ImageMediaExtra> = {
  empty: {
    ...ThumbnailsExtraMonoid.empty,
    width: 0,
    height: 0,
  },
  concat: (x, y) => ({ ...x, ...y }),
};

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

export const MediaExtra = t.union([ImageMediaExtra, VideoExtra], "MediaExtra");
export type MediaExtra = t.TypeOf<typeof MediaExtra>;

export const MediaExtraMonoid: Monoid<MediaExtra> = {
  empty: ImageMediaExtraMonoid.empty,
  concat: (x, y) => {
    if (!x) {
      return y;
    }

    if (!y) {
      return x;
    }

    return {
      ...x,
      ...y,
    };
  },
};
