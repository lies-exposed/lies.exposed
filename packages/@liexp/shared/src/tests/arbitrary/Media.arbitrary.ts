import * as tests from "@liexp/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { propsOmit } from "../../io/utils";

const mediaProps = propsOmit(http.Media.Media, [
  "id",
  "type",
  "thumbnail",
  "createdAt",
  "updatedAt",
  "creator",
  "links",
  "events",
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
      type: "image/png",
      creator: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
      location: placeKitten(),
      thumbnail: placeKitten(),
      id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
