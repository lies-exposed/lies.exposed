import { type Actor, type Group } from "../http";
import {
  ACTOR,
  GROUP,
  type BySubject,
  type BySubjectId,
  type UUID,
} from "../http/Common";

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
