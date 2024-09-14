import { propsOmit } from "@liexp/core/lib/io/utils.js";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const mediaProps = propsOmit(http.Media.Media, [
  "id",
  "type",
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
]);

export const placeKitten = (): string => {
  const [width, height] = tests.fc.sample(tests.fc.nat({ max: 3000 }), 2);
  return `https://placekitten.com/${width}/${height}`;
};

export const MediaArb: tests.fc.Arbitrary<http.Media.Media> = tests
  .getArbitrary(t.strict(mediaProps))
  .chain((props) =>
    tests.fc
      .record({
        location: tests.fc.webUrl({ size: "large" }),
        thumbnail: tests.fc.webUrl({ size: "large" }),
      })
      .map(({ location, thumbnail }) => {
        return {
          ...props,
          events: [],
          links: [],
          keywords: [],
          featuredInStories: [],
          areas: [],
          type: http.Media.PngType.value,
          creator: undefined,
          extra: undefined,
          socialPosts: undefined,
          location,
          thumbnail,
          id: tests.fc.sample(UUIDArb, 1)[0],
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: undefined,
        };
      }),
  );
