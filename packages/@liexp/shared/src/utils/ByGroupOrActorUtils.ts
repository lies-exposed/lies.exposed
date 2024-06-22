// import { Common } from "../io/http";
// import * as A from "fp-ts/Array";
// import { pipe } from "fp-ts/function";

// const getRelationUUID = (u: Common.ByGroupOrActor): string => {
//   if (Common.ByGroup.is(u)) {
//     return u.group;
//   }
//   return u.actor;
// };

// const findInEntities = (
//   type: typeof Common.ByGroup | typeof Common.ByActor,
//   entities: Common.ByGroupOrActor[],
//   uuids: string[]
// ): Common.ByGroupOrActor[] =>
//   pipe(
//     entities,
//     A.filter((o) => type.is(o) && uuids.includes(getRelationUUID(o)))
//   );

// export const lookForType =
//   (actors: Actor.Actor[], groups: Group.Group[]) =>
//   (
//     type: typeof Common.ByGroup | typeof Common.ByActor,
//     frontmatter: Events.Event,
//     uuids: string[]
//   ): boolean => {
//     switch (frontmatter.type) {
//       case "Arrest": {
//         if (type.is(frontmatter.who)) {
//           return uuids.includes(getRelationUUID(frontmatter.who));
//         }
//         return false;
//       }
//       case "Fined": {
//         if (type.is(frontmatter.who)) {
//           return uuids.includes(getRelationUUID(frontmatter.who));
//         }
//         return false;
//       }
//       case "Protest":
//         return findInEntities(type, frontmatter.organizers, uuids).length > 0;
//       case "Uncategorized":
//         if (type.type.props.type.value === "Group") {
//           return (
//             pipe(
//               frontmatter.groups,
//               O.fromPredicate((i) => i.length > 0),
//               O.map((actorIds) =>
//                 pipe(
//                   groups,
//                   A.filter((a) => actorIds.includes(a.id))
//                 )
//               ),
//               O.getOrElse((): Group.Group[] => [])
//             ).length > 0
//           );
//         }

//         return (
//           pipe(
//             frontmatter.actors,
//             O.fromPredicate((i) => i.length > 0),
//             O.map((ids) =>
//               pipe(
//                 actors,
//                 A.filter((a) => ids.includes(a.id))
//               )
//             ),
//             O.getOrElse((): Actor.Actor[] => [])
//           ).length > 0
//         );

//       default:
//         return false;
//     }
//   };

// interface ByGroupOrActorUtils {
//   isGroupInEvent: (event: Events.Event, uuids: string[]) => boolean;
//   isActorInEvent: (event: Events.Event, uuids: string[]) => boolean;
// }

// export const GetByGroupOrActorUtils = (
//   actors: Actor.Actor[],
//   groups: Group.Group[]
// ): ByGroupOrActorUtils => ({
//   isGroupInEvent: (event, uuids) =>
//     lookForType(actors, groups)(Common.ByGroup, event, uuids),
//   isActorInEvent: (event, uuids) =>
//     lookForType(actors, groups)(Common.ByActor, event, uuids),
// });
