import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";

const {
  createdAt,
  updatedAt,
  id,
  media,
  events,
  geometry,
  body,
  slug,
  socialPosts,
  featuredImage,
  ...areaProps
} = http.Area.Area.type.props;

export const AreaArb: tests.fc.Arbitrary<http.Area.Area> = tests
  .getArbitrary(t.strict({ ...areaProps }))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
    slug: tests.fc.sample(tests.fc.string({ minLength: 40 }), 1)[0],
    media: [],
    events: [],
    body: {},
    featuredImage: null,
    geometry: tests.fc.sample(
      tests.fc.record({
        type: tests.fc.constant("Polygon" as const),
        coordinates: tests.fc.array(
          tests.fc.array(
            tests.fc.tuple(tests.fc.integer(), tests.fc.integer()),
          ),
        ),
      }),
      1,
    )[0],
    socialPosts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
