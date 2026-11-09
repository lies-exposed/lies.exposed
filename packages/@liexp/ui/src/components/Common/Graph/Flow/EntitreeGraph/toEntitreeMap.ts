/**
 * Transforms the actor relation tree API response into
 * the format expected by EntitreeGraph / entitree-flex.
 *
 * entitree-flex only supports 4 accessors: children, parents,
 * nextAfter (spouses – right side), nextBefore (siblings – left side).
 * Partners are merged into the siblings array so they appear on the
 * left, while actual spouses stay on the right. `partnerIds` tracks
 * which siblings are really partners for distinct styling.
 */

export interface ActorTreeNode {
  id: string;
  name: string;
  fullName: string;
  avatar: string | null;
  bornOn: string | null;
  diedOn: string | null;
  children: string[];
  parents: string[];
  spouses: string[];
  partners: string[];
  siblings: string[];
  isSpouse?: boolean;
  isSibling?: boolean;
}

export type ActorTreeMap = Record<string, ActorTreeNode>;

export interface EntitreeNode {
  id: string;
  name: string;
  fullName?: string;
  avatar?: string | null;
  bornOn?: string | null;
  diedOn?: string | null;
  children: string[];
  parents: string[];
  spouses: string[];
  siblings: string[];
  /** IDs that are partners (subset of siblings, used for styling) */
  partnerIds: string[];
  isSpouse: boolean;
  isSibling: boolean;
}

export type EntitreeMap = Record<string, EntitreeNode>;

export const toEntitreeMap = (treeData: ActorTreeMap): EntitreeMap => {
  return Object.entries(treeData).reduce<EntitreeMap>(
    (acc, [actorId, node]) => {
      const partners = node.partners ?? [];
      acc[actorId] = {
        id: actorId,
        name: node.name,
        fullName: node.fullName,
        avatar: node.avatar,
        bornOn: node.bornOn,
        diedOn: node.diedOn,
        children: node.children ?? [],
        parents: node.parents ?? [],
        // Keep only actual spouses on the right (nextAfter)
        spouses: node.spouses ?? [],
        // Merge partners into siblings for left-side layout (nextBefore)
        siblings: [...(node.siblings ?? []), ...partners],
        partnerIds: partners,
        isSpouse: node.isSpouse ?? false,
        isSibling: node.isSibling ?? false,
      };
      return acc;
    },
    {},
  );
};
