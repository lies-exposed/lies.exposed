import * as tests from "@liexp/test";
import * as t from "io-ts";
import * as http from "../../io/http/index.js";
import { AreaArb } from "./Area.arbitrary.js";
import { ColorArb } from "./common/Color.arbitrary.js";
import { UUIDArb } from "./common/UUID.arbitrary.js";

const {
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  deletedAt: _deletedAt,
  areas,
  media,
  startDate: _startDate,
  endDate: _endDate,
  id,
  color,
  ...projectProps
} = http.Project.Project.type.props;

export const ProjectArb: tests.fc.Arbitrary<http.Project.Project> = tests
  .getArbitrary(t.strict({ ...projectProps }))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(UUIDArb, 1)[0],
    startDate: new Date(),
    endDate: new Date(),
    color: tests.fc.sample(ColorArb, 1)[0],
    areas: tests.fc.sample(AreaArb, 1),
    media: [],
    // media: tests.fc.sample(getImageArb(), 10),
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: undefined,
  }));
