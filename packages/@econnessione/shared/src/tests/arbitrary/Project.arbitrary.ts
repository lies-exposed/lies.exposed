import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";

const {
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  areas,
  images,
  startDate: _startDate,
  endDate: _endDate,
  ...projectProps
} = http.Project.Project.type.props;

export const ProjectArb: tests.fc.Arbitrary<http.Project.Project> = tests
  .getArbitrary(t.strict({ ...projectProps }))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
    startDate: new Date(),
    endDate: new Date(),
    areas: [],
    images: [],
    // images: tests.fc.sample(getImageArb(), 10),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
