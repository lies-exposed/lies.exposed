import {
  ActorHierarchyEdgeBundlingGraph,
  type ActorHierarchyEdgeBundlingGraphProps,
} from "@liexp/ui/lib/components/Graph/ActorHierarchyEdgeBundlingGraph.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/HierarchicalEdgeBundling",
  component: ActorHierarchyEdgeBundlingGraph,
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

const Template: StoryFn<ActorHierarchyEdgeBundlingGraphProps> = (args) => (
  <ActorHierarchyEdgeBundlingGraph {...args} />
);

export const ActorHierarchyEdgeBundlingExample = Template.bind({});
ActorHierarchyEdgeBundlingExample.args = {
  actor: "1bde0d49-03a1-411d-9f18-2e70a722532b",
  width: 600,
};
