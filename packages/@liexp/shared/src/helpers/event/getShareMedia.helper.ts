import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { VideoExtra } from "@liexp/io/lib/http/Media/index.js";
import {
  type SocialPost,
  type SocialPostContentMedia,
} from "@liexp/io/lib/http/SocialPost.js";
import * as http from "@liexp/io/lib/http/index.js";
import { Schema } from "effect";

export const getShareMultipleMedia = (
  media: readonly http.Media.Media[],
  defaultImage: string,
): SocialPostContentMedia => {
  const cover = media.reduce<SocialPostContentMedia>((acc, m) => {
    if (Schema.is(http.Media.MP4Type)(m.type)) {
      return acc.concat([
        {
          id: m.id,
          type: "video",
          media: m.location,
          thumbnail: m.thumbnail ?? defaultImage,
          duration: Schema.is(VideoExtra)(m.extra) ? m.extra.duration : 0,
        },
      ]);
    } else if (Schema.is(http.Media.PDFType)(m.type)) {
      return acc.concat([
        {
          id: m.id,
          type: "photo",
          media: m.location,
          thumbnail: m.thumbnail ?? defaultImage,
        },
      ]);
    } else if (
      Schema.is(http.Media.MP3Type)(m.type) ||
      Schema.is(http.Media.OGGType)(m.type)
    ) {
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
          id: m.id,
          type: "photo",
          media: m.thumbnail ?? m.location,
          thumbnail: m.thumbnail ?? defaultImage,
        },
      ]);
    }
  }, []);

  return cover.length > 0
    ? cover
    : [
        {
          id: uuid(),
          type: "photo",
          media: defaultImage,
          thumbnail: defaultImage,
        },
      ];
};

export const getShareMedia = (
  media: readonly http.Media.Media[],
  defaultImage: string,
): SocialPost["media"] => {
  return getShareMultipleMedia(media, defaultImage);
};
