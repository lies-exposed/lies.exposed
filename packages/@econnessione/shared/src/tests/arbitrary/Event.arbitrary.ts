import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";
import { HumanReadableStringArb } from "./utils.arbitrary";

const {
  createdAt: _createdAt,
  updatedAt: _updatedAt,
  images,
  groups,
  // links,
  startDate: _startDate,
  endDate: _endDate,
  ...eventProps
} = http.Events.Uncategorized.Uncategorized.type.props;

export const EventArb: tests.fc.Arbitrary<http.Events.Uncategorized.Uncategorized> =
  tests.getArbitrary(t.strict({ ...eventProps })).map((p) => {
    const coordinates = tests.fc.sample(tests.fc.float({ max: 60 }), 2);
    return {
      ...p,
      images: [],
      links: tests.fc.sample(tests.fc.uuidV(4)),
      // links: tests.fc.sample(
      //   tests.fc.record({
      //     id: tests.fc.uuid(),
      //     url: tests.fc.webUrl(),
      //     description: tests.fc.string(),
      //   }) as any,
      //   10
      // ),
      groups: [],
      id: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      title: tests.fc.sample(HumanReadableStringArb(), 1)[0],
      startDate: tests.fc.sample(
        tests.fc.date({ min: new Date("2010-01-01"), max: new Date() }),
        1
      )[0],
      endDate: tests.fc.sample(
        tests.fc.oneof(
          tests.fc.constant(undefined),
          tests.fc.date({ min: new Date("2010-01-01"), max: new Date() })
        ),
        1
      )[0],
      location: {
        type: "Point",
        coordinates: [coordinates[0], coordinates[1]],
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
