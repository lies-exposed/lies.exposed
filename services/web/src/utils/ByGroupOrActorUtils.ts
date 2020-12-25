import { Actor, Common, Events, Group } from "@econnessione/io"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"

const getRelationUUID = (u: Common.ByGroupOrActor): string => {
  if (Common.ByGroup.is(u)) {
    return u.group.id
  }
  return u.actor.id
}

const findInEntities = (
  type: typeof Common.ByGroup | typeof Common.ByActor,
  entities: Common.ByGroupOrActor[],
  uuids: string[]
): Common.ByGroupOrActor[] =>
  pipe(
    entities,
    A.filter((o) => type.is(o) && uuids.includes(getRelationUUID(o)))
  )

export const lookForType = (
  type: typeof Common.ByGroup | typeof Common.ByActor,
  frontmatter: Events.EventFrontmatter,
  uuids: string[]
): boolean => {
  switch (frontmatter.type) {
    case "Arrest": {
      if (type.is(frontmatter.who)) {
        return uuids.includes(getRelationUUID(frontmatter.who))
      }
      return false
    }
    case "Fined": {
      if (type.is(frontmatter.who)) {
        return uuids.includes(getRelationUUID(frontmatter.who))
      }
      return false
    }
    case "Protest":
      return findInEntities(type, frontmatter.organizers, uuids).length > 0
    case "Uncategorized":
      if (type.type.props.type.value === "Group") {
        return (
          pipe(
            frontmatter.groups,
            O.map(A.filter((a) => uuids.includes(a.id))),
            O.getOrElse((): Group.GroupFrontmatter[] => [])
          ).length > 0
        )
      }

      return (
        pipe(
          frontmatter.actors,
          O.map(A.filter((a) => uuids.includes(a.id))),
          O.getOrElse((): Actor.ActorFrontmatter[] => [])
        ).length > 0
      )

    default:
      return false
  }
}

interface ByGroupOrActorUtils {
  isGroupInEvent: (event: Events.EventFrontmatter, uuids: string[]) => boolean
  isActorInEvent: (event: Events.EventFrontmatter, uuids: string[]) => boolean
}

export const GetByGroupOrActorUtils = (): ByGroupOrActorUtils => ({
  isGroupInEvent: (event, uuids) => lookForType(Common.ByGroup, event, uuids),
  isActorInEvent: (event, uuids) => lookForType(Common.ByActor, event, uuids),
})
