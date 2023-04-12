import { propsOmit } from "@liexp/core/lib/io/utils";
import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http";

const mediaProps = propsOmit(http.Media.Media, [
  "id",
  "type",
  "thumbnail",
  "createdAt",
  "updatedAt",
  'deletedAt',
  "creator",
  "links",
  "events",
  "keywords",
]);

export const placeKitten = (): string => {
  const [width, height] = tests.fc.sample(tests.fc.nat({ max: 3000 }), 2);
  return `https://placekitten.com/${width}/${height}`;
};

export const MediaArb: tests.fc.Arbitrary<http.Media.Media> = tests
  .getArbitrary(t.strict(mediaProps))
  .map((i) => {
    return {
      ...i,
      events: [],
      links: [],
      keywords: [],
      type: "image/png",
      // creator: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
      creator: undefined,
      location: tests.fc.sample(tests.fc.webUrl(), 1)[0],
      thumbnail: tests.fc.sample(tests.fc.webUrl(), 1)[0],
      id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: undefined
    };
  });
