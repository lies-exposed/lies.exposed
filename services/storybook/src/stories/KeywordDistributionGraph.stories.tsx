import KeywordDistributionGraph, {
  type KeywordsDistributionGraphProps,
} from "@liexp/ui/lib/components/Graph/KeywordDistributionGraph.js";
import { type Meta, type StoryFn } from "@storybook/react";
import React from "react";

const meta: Meta = {
  title: "Components/Graph/KeywordDistribution",
  component: KeywordDistributionGraph,
  parameters: {
    docs: {
      description: {
        component: "Display keywords in a distribution graph",
      },
    },
  },
};
export default meta;

const Template: StoryFn<KeywordsDistributionGraphProps> = (args) => (
  <KeywordDistributionGraph {...args} />
);

export const KeywordDistributionGraphExample = Template.bind({});
KeywordDistributionGraphExample.args = {
  onClick: (w: any) => {
    alert(`${w.tag}: ${w.events}`);
  },
};
