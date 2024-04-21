import { type Actor, type Group } from "@liexp/shared/lib/io/http/index.js";

export function cleanItemsFromSlateFields<T extends Actor.Actor | Group.Group>(
  actors: T[],
): T[] {
  return actors.map(({ body, excerpt, ...a }: any) => ({
    ...a,
    excerpt: [{ type: "paragraph", text: "" }],
    body: [{ type: "paragraph", text: "" }],
  }));
}
