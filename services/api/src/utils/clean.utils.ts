import { type Actor, type Group } from "@liexp/io/lib/http/index.js";
// import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";

export function cleanItemsFromSlateFields<T extends Actor.Actor | Group.Group>(
  actors: readonly T[],
): readonly T[] {
  return actors.map((a) => ({
    ...a,
    excerpt: null,
    body: null,
  }));
}
