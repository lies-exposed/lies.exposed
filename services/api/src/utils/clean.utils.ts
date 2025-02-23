import { type Actor, type Group } from "@liexp/shared/lib/io/http/index.js";
// import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";

export function cleanItemsFromSlateFields<T extends Actor.Actor | Group.Group>(
  actors: T[],
): T[] {
  return actors.map((a) => ({
    ...a,
    excerpt: null,
    body: null,
  }));
}
