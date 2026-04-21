import { Schema } from "effect";
import { type Monoid } from "fp-ts/lib/Monoid.js";
import { URL } from "../Common/URL.js";

export const ThumbnailsExtraError = Schema.Struct({
  error: Schema.String,
}).annotations({
  title: "ThumbnailError",
});
export type ThumbnailsExtraError = typeof ThumbnailsExtraError.Type;

export const ThumbnailsExtraLocations = Schema.Array(URL).annotations({
  title: "Thumbnails",
});
export type ThumbnailsExtraLocations = typeof ThumbnailsExtraLocations.Type;

export const ThumbnailsExtra = Schema.Struct({
  thumbnailWidth: Schema.Number,
  thumbnailHeight: Schema.Number,
  thumbnails: Schema.Union(ThumbnailsExtraError, ThumbnailsExtraLocations),
  needRegenerateThumbnail: Schema.Boolean,
}).annotations({
  title: "ThumbnailsExtra",
});
export type ThumbnailsExtra = typeof ThumbnailsExtra.Type;

export const ThumbnailsExtraMonoid: Monoid<ThumbnailsExtra> = {
  empty: {
    thumbnailWidth: 0,
    thumbnailHeight: 0,
    needRegenerateThumbnail: true,
    thumbnails: [],
  },
  concat: (x, y) => ({ ...x, ...y }),
};

const ImageSizeExtra = Schema.Struct({
  width: Schema.Number,
  height: Schema.Number,
});

export const ImageMediaExtra = Schema.Struct({
  ...ThumbnailsExtra.fields,
  ...ImageSizeExtra.fields,
}).annotations({
  title: "ImageMediaExtra",
});
export type ImageMediaExtra = typeof ImageMediaExtra.Type;

export const ImageMediaExtraMonoid: Monoid<ImageMediaExtra> = {
  empty: {
    ...ThumbnailsExtraMonoid.empty,
    width: 0,
    height: 0,
  },
  concat: (x, y) => ({ ...x, ...y }),
};

export const TimeExtra = Schema.Struct({
  duration: Schema.Number,
}).annotations({
  title: "TimeExtra",
});
export type TimeExtra = typeof TimeExtra.Type;

export const VideoExtra = Schema.Struct({
  ...TimeExtra.fields,
  ...ImageSizeExtra.fields,
  thumbnails: Schema.Union(
    ThumbnailsExtraError,
    ThumbnailsExtraLocations,
    Schema.Undefined,
  ),
}).annotations({
  title: "VideoExtra",
});
export type VideoExtra = typeof VideoExtra.Type;

export const MediaExtra = Schema.Union(VideoExtra, ImageMediaExtra).annotations(
  {
    title: "MediaExtra",
  },
);
export type MediaExtra = typeof MediaExtra.Type;

export const VideoExtraMonoid: Monoid<VideoExtra> = {
  empty: {
    duration: 0,
    width: 0,
    height: 0,
    thumbnails: undefined,
  },
  concat: (x, y) => ({ ...x, ...y }),
};

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
