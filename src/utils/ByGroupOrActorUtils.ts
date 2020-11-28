import { ByActor, ByGroup, ByGroupOrActor } from "@models/Common/ByGroupOrActor"
import { ActorFrontmatter } from "@models/actor"
import { EventFrontmatter } from "@models/events"
import { GroupFrontmatter } from "@models/group"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"

const getRelationUUID = (u: ByGroupOrActor): string => {
  if (ByGroup.is(u)) {
    return u.group.uuid
  }
  return u.actor.uuid
}

const findInEntities = (
  type: typeof ByGroup | typeof ByActor,
  entities: ByGroupOrActor[],
  uuids: string[]
): ByGroupOrActor[] =>
  pipe(
    entities,
    A.filter((o) => type.is(o) && uuids.includes(getRelationUUID(o)))
  )

export const lookForType = (
  type: typeof ByGroup | typeof ByActor,
  frontmatter: EventFrontmatter,
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
        // eslint-disable-next-line no-case-declarations
        return (
          pipe(
            frontmatter.groups,
            O.map(A.filter((a) => uuids.includes(a.uuid))),
            O.getOrElse((): GroupFrontmatter[] => [])
          ).length > 0
        )
      }
      // eslint-disable-next-line no-case-declarations

      return (
        pipe(
          frontmatter.actors,
          O.map(A.filter((a) => uuids.includes(a.uuid))),
          O.getOrElse((): ActorFrontmatter[] => [])
        ).length > 0
      )

    default:
      return false
  }
}

interface ByGroupOrActorUtils {
  isGroupInEvent: (event: EventFrontmatter, uuids: string[]) => boolean
  isActorInEvent: (event: EventFrontmatter, uuids: string[]) => boolean
}

export const GetByGroupOrActorUtils = (): ByGroupOrActorUtils => ({
  isGroupInEvent: (event, uuids) => lookForType(ByGroup, event, uuids),
  isActorInEvent: (event, uuids) => lookForType(ByActor, event, uuids),
})
