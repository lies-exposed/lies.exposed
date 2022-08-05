import { Story, Meta } from "@storybook/react/types-6-0";
import React from "react";
import KeywordDistributionGraph, {
  KeywordsDistributionGraphProps,
} from "@liexp/ui/components/Graph/KeywordDistributionGraph";

const meta: Meta = {
  title: "Components/Graph/KeywordDistribution",
  component: KeywordDistributionGraph,
  parameters: {
    docs: {
      description: {
        component: "Generic component to display axis graph",
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
  onClick: () => {},
};
