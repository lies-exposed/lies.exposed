import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const {
  createdAt,
  updatedAt,
  deletedAt,
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

export type AreaArbType = Omit<
  http.Area.Area,
  "media" | "events" | "socialPosts"
> & {
  events: any[];
  media: any[];
  socialPosts: any[];
};

export const AreaArb: tests.fc.Arbitrary<AreaArbType> = tests
  .getArbitrary(t.strict({ ...areaProps }))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(UUIDArb, 1)[0],
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
    deletedAt: undefined,
  }));
