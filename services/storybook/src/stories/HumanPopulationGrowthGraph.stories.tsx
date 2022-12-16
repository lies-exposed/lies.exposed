import {
  HumanPopulationGrowthGraph,
  type HumanPopulationGrowthGraphProps,
} from "@liexp/ui/components/Graph/HumanPopulationGrowthGraph";
import { type Meta, type StoryFn as Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/HumanPopulationGrowthGraph",
  component: HumanPopulationGrowthGraph,
};

export default meta;

const Template: Story<HumanPopulationGrowthGraphProps> = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <HumanPopulationGrowthGraph {...props} />
    </div>
  );
};

const HumanPopulationGrowthGraphTemplate = Template.bind({});

const args: HumanPopulationGrowthGraphProps = {
  showPoints: true,
};

HumanPopulationGrowthGraphTemplate.args = args;

export { HumanPopulationGrowthGraphTemplate as HumanPopulationGrowth };
