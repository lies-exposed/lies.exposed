import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { ImageArb } from "./Image.arbitrary";

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

export const EventArb: tests.fc.Arbitrary<http.Events.Uncategorized.Uncategorized> = tests
  .getArbitrary(t.strict({ ...eventProps }))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
    startDate,
    endDate,
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
    links: [],
    images: tests.fc.sample(ImageArb, 5).map(({ id, ...image }) => image),
    groups: [],
    actors: [],
    groupsMembers: [],
    topics: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as any;
