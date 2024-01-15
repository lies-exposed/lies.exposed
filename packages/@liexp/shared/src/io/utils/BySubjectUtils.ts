import { fp } from "@liexp/core/lib/fp/index.js";
import { type Option } from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import {
  ACTOR,
  GROUP,
  type BySubject,
  type BySubjectId,
  type UUID,
} from "../http/Common/index.js";
import { type Actor, type Group } from "../http/index.js";

export const toBySubjectId = (type: ACTOR | GROUP, id: UUID): BySubjectId => {
  if (type === "Actor") {
    return {
      type: "Actor",
      id,
    };
  }

  return {
    type: "Group",
    id,
  };
};

export const toBySubject = <T extends ACTOR | GROUP>(
  type: T,
  _id: T extends ACTOR ? Actor.Actor : Group.Group,
): BySubject => {
  if (type === "Actor") {
    const id = _id as Actor.Actor;
    const byActor = {
      type: ACTOR.value,
      id,
    };
    return byActor;
  }

  return {
    type: GROUP.value,
    id: _id as Group.Group,
  };
};

export const findBySubject = (
  s: BySubjectId,
  actors: Actor.Actor[],
  groups: Group.Group[],
): Actor.Actor | Group.Group | undefined => {
  if (s.type === "Actor") {
    return actors.find((a) => a.id === s.id);
  }

  return groups.find((g) => g.id === s.id);
};

const toBySubjectArray = (
  ss: BySubjectId[],
  actors: Actor.Actor[],
  groups: Group.Group[],
): BySubject[] => {
  return ss.flatMap((s) => {
    const subject: BySubject["id"] | undefined = findBySubject(
      s,
      actors,
      groups,
    );
    if (subject) {
      const bySubject: BySubject = {
        type: s.type,
        id: subject,
      } as any;
      return [bySubject];
    }
    return [];
  });
};

const lookupForSubject = (
  subject: BySubjectId,
  actors: Actor.Actor[],
  groups: Group.Group[],
): Option<BySubject> => {
  return pipe(
    findBySubject(subject, actors, groups),
    fp.O.fromNullable,
    fp.O.map((s) => toBySubject(subject.type, s)),
  );
};

export const BySubjectUtils = {
  toBySubjectArray,
  lookupForSubject,
};
