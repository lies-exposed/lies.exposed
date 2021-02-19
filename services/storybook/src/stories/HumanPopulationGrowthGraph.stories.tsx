import {
  HumanPopulationGrowthGraph,
  HumanPopulationGrowthGraphProps,
} from "@econnessione/shared/components/Graph/HumanPopulationGrowthGraph";
import { Meta, Story } from "@storybook/react/types-6-0";
import { Block } from "baseui/block";
import { HeadingLarge } from "baseui/typography";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/HumanPopulationGrowthGraph",
  component: HumanPopulationGrowthGraph,
};

export default meta;

const Template: Story<HumanPopulationGrowthGraphProps> = (props) => {
  return (
    <Block overrides={{ Block: { style: { width: "100%" } } }}>
      <HeadingLarge>TODO</HeadingLarge>
      <HumanPopulationGrowthGraph {...props} />
    </Block>
  );
};

const HumanPopulationGrowthGraphTemplate = Template.bind({});

const args: HumanPopulationGrowthGraphProps = {
  showPoints: true,
};

HumanPopulationGrowthGraphTemplate.args = args;

export { HumanPopulationGrowthGraphTemplate as HumanPopulationGrowth };
