import * as http from "../../io/http";
import {
  type SocialPost,
  type SocialPostBodyMultipleMedia,
} from "../../io/http/SocialPost";

export const getShareSingleMedia = (
  media: http.Media.Media[],
  defaultImage: string
): string => {
  const cover = media.reduce<string | undefined>((cover, m) => {
    if (!cover) {
      if (http.Media.IframeVideoType.is(m.type)) {
        return m.thumbnail;
      } else if (http.Media.MP4Type.is(m.type)) {
        return m.thumbnail;
      } else if (http.Media.ImageType.is(m.type)) {
        return m.thumbnail;
      }
    }
    return cover;
  }, undefined);

  return cover ?? defaultImage;
};

export const getShareMultipleMedia = (
  media: http.Media.Media[],
  defaultImage: string
): SocialPostBodyMultipleMedia => {
  const cover = media.reduce<SocialPostBodyMultipleMedia>((acc, m) => {
    if (http.Media.IframeVideoType.is(m.type)) {
      return acc.concat([{ type: "photo", media: m.thumbnail as any }]);
    } else if (http.Media.MP4Type.is(m.type)) {
      return acc.concat([{ type: "video", media: m.location }]);
    } else if (http.Media.ImageType.is(m.type)) {
      return acc.concat([{ type: "photo", media: m.thumbnail ?? m.location }]);
    }

    return acc;
  }, []);

  return cover.length > 0 ? cover : [{ type: "photo", media: defaultImage }];
};

export const getShareMedia = (
  media: http.Media.Media[],
  defaultImage: string,
  multiple: boolean
): SocialPost["media"] => {
  if (multiple) {
    return getShareMultipleMedia(media, defaultImage);
  }
  return getShareSingleMedia(media, defaultImage);
};
