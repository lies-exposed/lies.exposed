import type { Graph } from "@visx/network/lib/types.js";

export interface HierarchicalEdgeBundlingDatum {
  id: string;
  label: string;
  avatar?: string;
  color?: string;
  text?: string;
  group: string;
  targets: string[];
}

interface Link {
  source: string;
  target: string;
  value: number;
}

export interface HierarchicalEdgeBundlingProps {
  width: number;
  hideLabels?: boolean;
  graph: Graph<Link, HierarchicalEdgeBundlingDatum>;
}
