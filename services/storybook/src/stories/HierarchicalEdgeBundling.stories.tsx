import { uuid } from "@liexp/shared/utils/uuid";
import {
  HierarchicalEdgeBundling,
  HierarchicalEdgeBundlingProps,
} from "@liexp/ui/components/Common/Graph/HierarchicalEdgeBundling";
import { Story, Meta } from "@storybook/react/types-6-0";
import * as A from "fp-ts/lib/Array";
import React from "react";

const meta: Meta = {
  title: "Components/Graph/HierarchicalEdgeBundling",
  component: HierarchicalEdgeBundling,
  parameters: {
    docs: {
      description: {
        component:
          "Based on [Bilevel Edge Bundling](https://observablehq.com/@d3/bilevel-edge-bundling?collection=@d3/d3-hierarchy)",
      },
    },
  },
};
export default meta;

const Template: Story<HierarchicalEdgeBundlingProps> = (args) => (
  <HierarchicalEdgeBundling {...args} />
);

const actors = A.range(0, 60).map(() => uuid().substr(0, 8));
const nodes = actors.map((a) => ({
  id: a as any,
  label: a,
  group: Math.floor(Math.random() * 10).toString(),
  targets: A.range(0, Math.floor(Math.random() * 5)).map(
    () => actors[Math.floor(Math.random() * actors.length)]
  ),
}));

const links = nodes.flatMap((n) => {
  return n.targets.map((t) => ({
    source: n.id,
    target: t as any,
    value: Math.floor(Math.random() * 5 + 1),
  }));
});

export const ActorsRelations = Template.bind({});
ActorsRelations.args = {
  width: 600,
  graph: {
    nodes,
    links,
  },
};
