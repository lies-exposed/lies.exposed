import {
  KeywordHierarchyEdgeBundlingGraph,
  type KeywordHierarchyEdgeBundlingGraphProps,
} from "@liexp/ui/lib/components/Graph/KeywordHierarchyEdgeBundlingGraph.js";
import { Box } from "@mui/material";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/HierarchicalEdgeBundling",
  component: KeywordHierarchyEdgeBundlingGraph,
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

const Template: StoryFn<KeywordHierarchyEdgeBundlingGraphProps> = (args) => (
  <Box style={{ width: args.width }}>
    <KeywordHierarchyEdgeBundlingGraph {...args} />
  </Box>
);

export const KeywordHierarchyEdgeBundlingExampleActorsRelations = Template.bind(
  {},
);
KeywordHierarchyEdgeBundlingExampleActorsRelations.args = {
  keyword: "fe502631-ef4e-4dfc-a1ff-c2cd04f3ff6d",
  width: 600,
};
