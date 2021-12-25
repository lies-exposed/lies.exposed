import * as tests from "@econnessione/core/tests";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import * as http from "../../io/http";

// const groupUnsupportedKeys = ["craetedAt", "updateAt"];
// const groupProps = pipe(
//   http.Group.Group.type.props,
//   R.filterMapWithIndex((k, p) =>
//     pipe(
//       p,
//       O.fromPredicate(() => groupUnsupportedKeys.includes(k))
//     )
//   )
// );

// export const GroupArb: tests.fc.Arbitrary<http.Group.Group> = tests
//   .getArbitrary(t.strict({ ...groupProps }, "Group"))
//   .map(
//     (p): http.Group.Group =>
//       // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
//       ({
//         ...p,
//         id: tests.fc.sample(tests.fc.uuid(), 1)[0] as any,
//         // media: tests.fc.sample(getImageArb(), 10),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//       } as any)
//   );

const groupMemberUnsupportedKeys = ["id", "body2", "createdAt", "updatedAt"];
const groupMemberProps = pipe(
  http.Group.Group.type.props,
  R.filterMapWithIndex((k, p) =>
    pipe(
      p,
      O.fromPredicate(() => !groupMemberUnsupportedKeys.includes(k))
    )
  )
);

export const GroupMemberArb: tests.fc.Arbitrary<http.GroupMember.GroupMember> =
  tests
    .getArbitrary(t.strict({ ...groupMemberProps }, "GroupMember"))
    .map((p) => ({
      ...p,
      id: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      startDate: new Date(),
      endDate: new Date(),
      actor: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      group: tests.fc.sample(tests.fc.uuidV(4), 1)[0] as any,
      body: "",
      excerpt: tests.fc.sample(tests.fc.string())[0],
      body2: {},
      events: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
