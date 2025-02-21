import * as http from "@liexp/shared/lib/io/http/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import fc from "fast-check";
import { getArbitrary } from "fast-check-io-ts";
import * as t from "io-ts";
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

export const AreaArb: fc.Arbitrary<AreaArbType> = getArbitrary(
  t.strict({ ...areaProps }),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  slug: fc.sample(fc.string({ minLength: 40 }), 1)[0],
  media: [],
  events: [],
  body: toInitialValue("Area content body"),
  featuredImage: null,
  geometry: fc.sample(
    fc.record({
      type: fc.constant("Polygon" as const),
      coordinates: fc.array(fc.array(fc.tuple(fc.integer(), fc.integer()))),
    }),
    1,
  )[0],
  socialPosts: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
}));
