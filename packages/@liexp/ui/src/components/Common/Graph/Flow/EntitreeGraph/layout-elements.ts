import { type Edge, type Node, Position } from "@xyflow/react";
import { layoutFromMap } from "entitree-flex";

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

const edgeColors: Record<RelationType, string> = {
  parent_child: "#555",
  spouse: "#e91e63",
  partner: "#9c27b0",
  sibling: "#4caf50",
};

const { Top, Bottom, Left, Right } = Position;

const resolveRelationType = (
  sourceNode: any,
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
  tree: any,
  rootId: string | number,
  direction = "TB",
): { nodes: Node[]; edges: Edge[] } => {
  const isTreeHorizontal = direction === "LR";

  const { nodes: entitreeNodes, rels: entitreeEdges } = layoutFromMap<any>(
    rootId,
    tree,
    {
      ...entitreeSettings,
      orientation: isTreeHorizontal
        ? Orientation.Horizontal
        : Orientation.Vertical,
    },
  );

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

  entitreeEdges.forEach((edge: any) => {
    const sId: string = edge.source.id;
    const tId: string = edge.target.id;
    const rel = resolveRelationType(tree[sId], tId);
    const existing = nodeRoles.get(tId);
    if (!existing || rolePriority[rel] < rolePriority[existing]) {
      nodeRoles.set(tId, rel);
    }
  });

  entitreeEdges.forEach((edge: any) => {
    const sourceId: string = edge.source.id;
    const targetId: string = edge.target.id;

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
        stroke: edgeColors[relationType],
        strokeWidth: relationType === "parent_child" ? 2 : 1.5,
        strokeDasharray: relationType === "partner" ? "6 3" : undefined,
      },
      label: relationType === "partner" ? "partner" : undefined,
      data: { relationType },
    } as Edge);
  });

  entitreeNodes.forEach((node: any) => {
    const isRoot = node?.id === rootId;

    // Use the primary role derived from edges (parent_child wins over sibling)
    const primaryRole = nodeRoles.get(node.id);
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
      id: node.id,
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
