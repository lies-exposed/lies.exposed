import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";

const {
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  images,
  groups,
  links,
  startDate: _startDate,
  endDate: _endDate,
  ...eventProps
} = http.Events.Uncategorized.Uncategorized.type.props;
const startDate = new Date();
const endDate = new Date();

export const EventArb: tests.fc.Arbitrary<http.Events.Uncategorized.Uncategorized> =
  tests.getArbitrary(t.strict({ ...eventProps })).map((p) => ({
    ...p,
    images: [],
    links: tests.fc.sample(
      tests.fc.record({
        id: tests.fc.uuid(),
        url: tests.fc.webUrl(),
        description: tests.fc.string(),
      }) as any,
      10
    ),
    groups: [],
    id: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
    title: tests.fc.sample(tests.fc.string({ minLength: 1 }), 1)[0],
    startDate,
    endDate,
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
