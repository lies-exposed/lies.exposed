import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";

const {
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  areas,
  media,
  startDate: _startDate,
  endDate: _endDate,
  id,
  ...projectProps
} = http.Project.Project.type.props;

export const ProjectArb: tests.fc.Arbitrary<http.Project.Project> = tests
  .getArbitrary(t.strict({ ...projectProps }))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
    startDate: new Date(),
    endDate: new Date(),
    areas: [
      {
        id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
        label: "default geometry",
        body: "irrelevant",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [-351.9827194, 45.5162451],
              [-350.8204059, 44.9384085],
              [-349.7264637, 45.6597865],
              [-350.6836631, 46.0882086],
              [-351.9827194, 45.5162451],
            ],
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
    media: [],
    // media: tests.fc.sample(getImageArb(), 10),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
