import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";

const {
  createdAt,
  updatedAt,
  id,
  location,
  ...imageProps
} = http.Image.Image.type.props;

export const ImageArb: tests.fc.Arbitrary<http.Image.Image> = tests
  .getArbitrary(t.strict({ ...imageProps }))
  .map((i) => ({
    ...i,
    location: tests.fc.sample(tests.fc.webUrl(), 1)[0],
    id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
  })) as any;
