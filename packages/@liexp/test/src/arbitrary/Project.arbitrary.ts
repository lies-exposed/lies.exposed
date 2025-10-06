import * as http from "@liexp/shared/lib/io/http/index.js";
import { Arbitrary, Schema } from "effect";
import fc from "fast-check";
import { AreaArb } from "./Area.arbitrary.js";
import { ColorArb } from "./common/Color.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const {
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  deletedAt: _deletedAt,
  areas: _areas,
  media: _media,
  startDate: _startDate,
  endDate: _endDate,
  id: _id,
  color: _color,
  ...projectProps
} = http.Project.Project.fields;

export const ProjectArb: fc.Arbitrary<http.Project.Project> = Arbitrary.make(
  Schema.Struct({ ...projectProps }),
).map((p) => ({
  ...p,
  id: fc.sample(UUIDArb, 1)[0],
  startDate: new Date(),
  endDate: new Date(),
  color: fc.sample(ColorArb, 1)[0],
  areas: fc.sample(AreaArb, 1),
  media: [],
  // media: fc.sample(getImageArb(), 10),
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: undefined,
}));
