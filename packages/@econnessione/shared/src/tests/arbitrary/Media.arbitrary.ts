import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { propsOmit } from "./utils.arbitrary";

const mediaProps = propsOmit(http.Media.Media, [
  "id",
  "type",
  "thumbnail",
  "createdAt",
  "updatedAt",
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
      type: "image/png",
      location: placeKitten(),
      thumbnail: placeKitten(),
      id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
