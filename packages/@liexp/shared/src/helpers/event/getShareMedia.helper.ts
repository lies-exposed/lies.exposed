import {
  type SocialPost,
  type SocialPostBodyMultipleMedia,
} from "../../io/http/SocialPost.js";
import * as http from "../../io/http/index.js";

export const getShareMultipleMedia = (
  media: http.Media.Media[],
  defaultImage: string,
): SocialPostBodyMultipleMedia => {
  const cover = media.reduce<SocialPostBodyMultipleMedia>((acc, m) => {
    if (http.Media.MP4Type.is(m.type)) {
      return acc.concat([
        {
          type: "video",
          media: m.location,
          thumbnail: m.thumbnail ?? defaultImage,
          duration: m.extra?.duration ?? 0,
        },
      ]);
    } else if (http.Media.PDFType.is(m.type)) {
      return acc.concat([
        {
          type: "photo",
          media: m.location,
          thumbnail: m.thumbnail ?? defaultImage,
        },
      ]);
    } else if (http.Media.MP3Type.is(m.type) || http.Media.OGGType.is(m.type)) {
      // return acc.concat([
      //   {
      //     type: "photo",
      //     media: m.thumbnail ?? defaultImage,
      //     thumbnail: m.thumbnail ?? defaultImage,
      //   },
      // ]);
      return acc;
    } else {
      return acc.concat([
        {
          type: "photo",
          media: m.thumbnail ?? m.location,
          thumbnail: m.thumbnail ?? defaultImage,
        },
      ]);
    }
  }, []);

  return cover.length > 0
    ? cover
    : [{ type: "photo", media: defaultImage, thumbnail: defaultImage }];
};

export const getShareMedia = (
  media: http.Media.Media[],
  defaultImage: string,
): SocialPost["media"] => {
  return getShareMultipleMedia(media, defaultImage);
};
