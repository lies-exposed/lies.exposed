import { GroupFrontmatter } from "@models/group"
import { eqString } from "fp-ts/lib/Eq"

export const getGroups = (groups: GroupFrontmatter[]) => (
  uuids: string[]
): GroupFrontmatter[] => {
  return uuids.reduce<GroupFrontmatter[]>((acc, uuid) => {
    const actor = groups.find((a) => eqString.equals(a.uuid, uuid))
    return actor !== undefined ? acc.concat(actor) : acc
  }, [])
}
