import { eqString } from "fp-ts/Eq";
import { type Group } from "../io/http";

export const getGroups =
  (groups: Group.Group[]) =>
  (uuids: string[]): Group.Group[] => {
    return uuids.reduce<Group.Group[]>((acc, id) => {
      const group = groups.find((a) => eqString.equals(a.id, id));
      return group !== undefined ? acc.concat(group) : acc;
    }, []);
  };
