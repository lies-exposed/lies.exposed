import { type Actor, type Group } from "@liexp/shared/lib/io/http/index.js";

/**
 * Remove slate fields from given actors or groups
 * @param actors - Array of actors {@link Actor.Actor} or groups {@link Group.Group}
 * @returns Array of actors or groups without slate fields
 */
export function cleanItemsFromSlateFields<T extends Actor.Actor | Group.Group>(
  actors: T[],
): T[] {
  return actors.map(({ body, excerpt, ...a }: any) => ({
    ...a,
    excerpt: [{ id: "1", type: "paragraph", text: "", props: {}, content: "" }],
    body: [{ id: "2", type: "paragraph", text: "", props: {}, content: "" }],
  }));
}
