import * as tests from "@econnessione/core/tests";
import * as t from "io-ts";
import * as http from "../../io/http";

const { createdAt, updatedAt, ...actorProps } = http.Actor.Actor.type.props;

export const ActorArb: tests.fc.Arbitrary<http.Actor.Actor> = tests
  .getArbitrary(t.strict({ ...actorProps }))
  .map((p) => ({
    ...p,
    id: tests.fc.sample(tests.fc.uuidV(4), 1)[0],
    fullName: tests.fc.sample(tests.fc.string({ minLength: 10 }), 1)[0],
    username: tests.fc.sample(tests.fc.string({ minLength: 10 }), 1)[0],
    color: tests.fc
      .sample(tests.fc.hexaString({ maxLength: 6, minLength: 6 }), 1)[0]
      .substring(0, 6) as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
