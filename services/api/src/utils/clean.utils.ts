import { type Actor, type Group } from "@liexp/shared/lib/io/http";

export function cleanItemsFromSlateFields<T extends Actor.Actor | Group.Group>(
  actors: T[],
): T[] {
  return actors.map(({ body, excerpt, ...a }: any) => ({
    ...a,
    excerpt: {},
    body: {},
  }));
}
