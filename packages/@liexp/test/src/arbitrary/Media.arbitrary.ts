import { type URL } from "@liexp/io/lib/http/Common/URL.js";
import * as Media from "@liexp/io/lib/http/Media/index.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { URLArb } from "./URL.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const mediaProps = Media.Media.omit(
  "id",
  "type",
  "location",
  "thumbnail",
  "createdAt",
  "updatedAt",
  "deletedAt",
  "creator",
  "extra",
  "links",
  "events",
  "keywords",
  "areas",
  "featuredInStories",
  "socialPosts",
);

export const placeKitten = (): URL => {
  const [width, height] = fc.sample(fc.nat({ max: 3000 }), 2);
  return `https://placekitten.com/${width}/${height}` as URL;
};

export const MediaArb: fc.Arbitrary<Media.Media> = Arbitrary.make(
  mediaProps,
).chain((props) =>
  fc
    .record({
      location: URLArb,
      thumbnail: URLArb,
    })
    .map(({ location, thumbnail }) => {
      return {
        ...props,
        events: [],
        links: [],
        keywords: [],
        featuredInStories: [],
        areas: [],
        type: Media.PngType.literals[0],
        creator: undefined,
        extra: undefined,
        socialPosts: undefined,
        location,
        thumbnail,
        id: fc.sample(UUIDArb, 1)[0],
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: undefined,
      };
    }),
);
