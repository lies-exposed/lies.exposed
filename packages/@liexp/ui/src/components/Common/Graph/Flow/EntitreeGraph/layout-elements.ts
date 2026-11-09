import { type Edge, type Node, Position } from "@xyflow/react";
import { layoutFromMap, type TreeNode } from "entitree-flex";
import { type Theme } from "../../../../../theme/index.js";
import { getRelationshipColor } from "../../../../../theme/styleUtils.js";

const nodeWidth = 150;
const nodeHeight = 40;

const Orientation = {
  Vertical: "vertical" as const,
  Horizontal: "horizontal" as const,
};

const entitreeSettings = {
  clone: true,
  enableFlex: true,
  firstDegreeSpacing: 60,
  nextAfterAccessor: "spouses",
  nextAfterSpacing: 60,
  nextBeforeAccessor: "siblings",
  nextBeforeSpacing: 60,
  nodeHeight,
  nodeWidth,
  orientation: Orientation.Vertical,
  rootX: 0,
  rootY: 0,
  secondDegreeSpacing: 60,
  sourcesAccessor: "parents",
  sourceTargetSpacing: 60,
  targetsAccessor: "children",
};

export type RelationType = "parent_child" | "spouse" | "partner" | "sibling";

export interface EntitreeTreeEntry {
  id: string | number;
  name?: string;
  fullName?: string;
  siblings?: string[];
  partnerIds?: string[];
  spouses?: string[];
  children?: string[];
  parents?: string[];
  x?: number;
  y?: number;
  [key: string]: unknown;
}

type EntitreeNode = TreeNode<EntitreeTreeEntry>;

interface EntitreeEdge {
  source: EntitreeNode;
  target: EntitreeNode;
}

const { Top, Bottom, Left, Right } = Position;

/**
 * Resolve relationship type between two nodes.
 * Used to determine edge styling and node positioning.
 */
const resolveRelationType = (
  sourceNode: EntitreeTreeEntry,
  targetId: string,
): RelationType => {
  const siblings: string[] = sourceNode?.siblings ?? [];
  const partnerIds: string[] = sourceNode?.partnerIds ?? [];
  const spouses: string[] = sourceNode?.spouses ?? [];

  if (partnerIds.includes(targetId)) return "partner";
  if (siblings.includes(targetId)) return "sibling";
  if (spouses.includes(targetId)) return "spouse";
  return "parent_child";
};

export const layoutElements = (
  tree: Record<string | number, EntitreeTreeEntry>,
  rootId: string | number,
  direction = "TB",
  theme?: Theme,
): { nodes: Node[]; edges: Edge[] } => {
  const isTreeHorizontal = direction === "LR";

  let entitreeNodes: EntitreeNode[];
  let entitreeEdges: EntitreeEdge[];
  try {
    const result = layoutFromMap<EntitreeTreeEntry>(rootId, tree, {
      ...entitreeSettings,
      orientation: isTreeHorizontal
        ? Orientation.Horizontal
        : Orientation.Vertical,
    });
    entitreeNodes = result.nodes;
    entitreeEdges = result.rels;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      "[EntitreeGraph] layoutFromMap failed (likely circular relation data):",
      e,
    );
    return { nodes: [], edges: [] };
  }

  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // First pass: build a role map from edges so each node gets a primary role.
  // parent_child takes priority over sibling (a child can also be a sibling
  // of another child, but should be styled as a child).
  const rolePriority: Record<RelationType, number> = {
    parent_child: 0,
    spouse: 1,
    partner: 2,
    sibling: 3,
  };
  const nodeRoles = new Map<string, RelationType>();

  entitreeEdges.forEach((edge: EntitreeEdge) => {
    const sId = String(edge.source.id);
    const tId = String(edge.target.id);
    const rel = resolveRelationType(tree[sId], tId);
    const existing = nodeRoles.get(tId);
    if (!existing || rolePriority[rel] < rolePriority[existing]) {
      nodeRoles.set(tId, rel);
    }
  });

  entitreeEdges.forEach((edge: EntitreeEdge) => {
    const sourceId = String(edge.source.id);
    const targetId = String(edge.target.id);

    const sourceNode = tree[sourceId];
    const relationType = resolveRelationType(sourceNode, targetId);

    const isTargetSpouse = relationType === "spouse";
    const isTargetPartner = relationType === "partner";
    const isTargetSibling = relationType === "sibling";

    let sourceHandle: string;
    let targetHandle: string;

    if (isTargetSpouse) {
      // Spouses on the right (nextAfter)
      sourceHandle = isTreeHorizontal ? Bottom : Right;
      targetHandle = isTreeHorizontal ? Top : Left;
    } else if (isTargetPartner || isTargetSibling) {
      // Partners and siblings on the left (nextBefore)
      sourceHandle = isTreeHorizontal ? Top : Left;
      targetHandle = isTreeHorizontal ? Bottom : Right;
    } else {
      // Parent-child: below (targets)
      sourceHandle = isTreeHorizontal ? Right : Bottom;
      targetHandle = isTreeHorizontal ? Left : Top;
    }

    edges.push({
      id: `e${sourceId}${targetId}`,
      source: sourceId,
      target: targetId,
      type: "smoothstep",
      animated: relationType === "partner",
      sourceHandle,
      targetHandle,
      style: {
        stroke: theme ? getRelationshipColor(theme, relationType) : "#555",
        strokeWidth: relationType === "parent_child" ? 2 : 1.5,
        strokeDasharray: relationType === "partner" ? "6 3" : undefined,
      },
      label: relationType === "partner" ? "partner" : undefined,
      data: { relationType },
    } as Edge);
  });

  entitreeNodes.forEach((node: EntitreeNode) => {
    const isRoot = node?.id === rootId;

    // Use the primary role derived from edges (parent_child wins over sibling)
    const primaryRole = nodeRoles.get(String(node.id));
    const isSpouse = primaryRole === "spouse";
    const isSibling = primaryRole === "sibling";
    const isPartner = primaryRole === "partner";

    let sourcePosition: string;
    let targetPosition: string;

    if (isSpouse) {
      // Spouses on the right
      sourcePosition = isTreeHorizontal ? Bottom : Right;
      targetPosition = isTreeHorizontal ? Top : Left;
    } else if (isPartner || isSibling) {
      // Partners and siblings on the left
      sourcePosition = isTreeHorizontal ? Top : Left;
      targetPosition = isTreeHorizontal ? Bottom : Right;
    } else {
      sourcePosition = isTreeHorizontal ? Right : Bottom;
      targetPosition = isTreeHorizontal ? Left : Top;
    }

    nodes.push({
      id: String(node.id),
      type: "custom",
      sourcePosition,
      targetPosition,
      width: nodeWidth,
      height: nodeHeight,
      position: { x: node.x, y: node.y },
      data: {
        ...node,
        label: node.name,
        direction,
        isRoot,
        isSpouse,
        isSibling,
        isPartner,
      },
    } as Node);
  });

  return { nodes, edges };
};
