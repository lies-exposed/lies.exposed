import KeywordDistributionGraph, {
  KeywordsDistributionGraphProps,
} from "@liexp/ui/components/Graph/KeywordDistributionGraph";
import { Story, Meta } from "@storybook/react/types-6-0";
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

const Template: Story<KeywordsDistributionGraphProps> = (args) => (
  <KeywordDistributionGraph {...args} />
);

export const KeywordDistributionGraphExample = Template.bind({});
KeywordDistributionGraphExample.args = {
  onClick: (w: any) => {
    alert(`${w.tag}: ${w.events}`);
  },
};
