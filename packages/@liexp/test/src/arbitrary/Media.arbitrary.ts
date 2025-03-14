import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary } from "effect";
import fc from "fast-check";
import { URLArb } from "./URL.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const mediaProps = http.Media.Media.omit(
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

export const MediaArb: fc.Arbitrary<http.Media.Media> = Arbitrary.make(
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
        type: http.Media.PngType.Type,
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
