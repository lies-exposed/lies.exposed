import * as http from "../../io/http";

export const getShareMedia = (
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
