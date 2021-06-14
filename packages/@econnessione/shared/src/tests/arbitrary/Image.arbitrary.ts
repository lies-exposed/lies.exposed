import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";

const { createdAt, updatedAt, id, location, ...imageProps } =
  http.Image.Image.type.props;

const placeKittenArb = (): string => {
  const [width, height] = tests.fc.sample(tests.fc.nat({ max: 3000 }), 2);
  return `https://placekitten.com/${width}/${height}`;
};

export const ImageArb: tests.fc.Arbitrary<http.Image.Image> = tests
  .getArbitrary(t.strict({ ...imageProps }))
  .map((i) => {
    return {
      ...i,
      location: placeKittenArb(),
      id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
    };
  }) as any;
