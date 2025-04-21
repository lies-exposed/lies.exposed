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

export const makeBySubjectId = (type: ACTOR | GROUP, id: UUID): BySubjectId => {
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

export const makeBySubject = <T extends ACTOR | GROUP>(
  type: T,
  _id: T extends ACTOR ? Actor.Actor : Group.Group,
): BySubject => {
  if (type === "Actor") {
    const id = _id as Actor.Actor;
    const byActor = {
      type: ACTOR.literals[0],
      id,
    };
    return byActor;
  }

  return {
    type: GROUP.literals[0],
    id: _id as Group.Group,
  };
};

export const findBySubject = (
  s: BySubjectId,
  actors: readonly Actor.Actor[],
  groups: readonly Group.Group[],
): Actor.Actor | Group.Group | undefined => {
  if (s.type === "Actor") {
    return actors.find((a) => a.id === s.id);
  }

  return groups.find((g) => g.id === s.id);
};

const toBySubjectArray = (
  ss: readonly BySubjectId[],
  actors: readonly Actor.Actor[],
  groups: readonly Group.Group[],
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
        id: subject as any,
      };
      return [bySubject];
    }
    return [];
  });
};

const lookupForSubject = (
  subject: BySubjectId,
  actors: readonly Actor.Actor[],
  groups: readonly Group.Group[],
): Option<BySubject> => {
  return pipe(
    findBySubject(subject, actors, groups),
    fp.O.fromNullable,
    fp.O.map((s) => makeBySubject(subject.type, s)),
  );
};

const toSubjectId = (s: BySubject): BySubjectId => {
  return {
    type: s.type,
    id: s.id.id,
  };
};

const toSubjectIds = (ss: readonly BySubject[]): BySubjectId[] => {
  return ss.map(toSubjectId);
};

export const BySubjectUtils = {
  toBySubjectArray,
  lookupForSubject,
  toSubjectId,
  toSubjectIds,
};
