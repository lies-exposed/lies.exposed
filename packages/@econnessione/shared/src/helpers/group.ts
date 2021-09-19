import { eqString } from "fp-ts/lib/Eq";
import { Group } from "@io/http";

export const getGroups =
  (groups: Group.GroupFrontmatter[]) =>
  (uuids: string[]): Group.GroupFrontmatter[] => {
    return uuids.reduce<Group.GroupFrontmatter[]>((acc, id) => {
      const actor = groups.find((a) => eqString.equals(a.id, id));
      return actor !== undefined ? acc.concat(actor) : acc;
    }, []);
  };
