import * as tests from "@econnessione/core/tests";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import * as http from "../io/http";

const foldToAnything = <T>(arb: tests.fc.Arbitrary<T>): tests.fc.Arbitrary<T> =>
  pipe(
    E.tryCatch(() => arb, E.toError),
    E.fold(
      (e) => {
        // eslint-disable-next-line no-console
        console.error("getArbitrary failed", e);
        return tests.fc.anything() as any;
      },
      (a) => a
    )
  );

export const getImageArb = (): tests.fc.Arbitrary<http.Image.Image> => {
  const { createdAt, updatedAt, id, location, ...imageProps } = http.Image.Image.type.props;

  return foldToAnything(
    tests.getArbitrary(t.strict({ ...imageProps })).map((i) => ({
      ...i,
      location: tests.fc.sample(tests.fc.webUrl(), 1)[0],
      id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
    })) as any
  );
};

export const getProjectArb = (): tests.fc.Arbitrary<http.Project.Project> => {
  const {
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    areas,
    images,
    startDate: _startDate,
    endDate: _endDate,
    ...projectProps
  } = http.Project.Project.type.props;
  const startDate = new Date();
  const endDate = new Date();

  return foldToAnything(
    tests.getArbitrary(t.strict({ ...projectProps })).map((p) => ({
      ...p,
      id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
      startDate,
      endDate,
      areas: [],
      images: [],
      // images: tests.fc.sample(getImageArb(), 10),
      createdAt: new Date(),
      updatedAt: new Date(),
    }))
  );
};
