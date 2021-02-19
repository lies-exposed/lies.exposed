import {
  WealthDistributionGraph,
  WealthDistributionGraphProps
} from "@econnessione/shared/components/Graph/WealthDistributionGraph";
import { Meta, Story } from "@storybook/react/types-6-0";
import { Block } from "baseui/block";
import { HeadingLarge } from "baseui/typography";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/WealthDistributionGraph",
  component: WealthDistributionGraph,
};

export default meta;

const Template: Story<WealthDistributionGraphProps> = (props) => {
  return (
    <Block overrides={{ Block: { style: { width: "100%" } } }}>
      <HeadingLarge>Global Wealth Distribution</HeadingLarge>
      <WealthDistributionGraph {...props} />
    </Block>
  );
};

const HumanPopulationGrowthGraphTemplate = Template.bind({});

const args: WealthDistributionGraphProps = {
  
};

HumanPopulationGrowthGraphTemplate.args = args;

export { HumanPopulationGrowthGraphTemplate as HumanPopulationGrowth };
