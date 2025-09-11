import {
  HumanPopulationGrowthGraph,
  type HumanPopulationGrowthGraphProps,
} from "@liexp/ui/lib/components/Graph/HumanPopulationGrowthGraph.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/HumanPopulationGrowthGraph",
  component: HumanPopulationGrowthGraph,
};

export default meta;

const Template: StoryFn<HumanPopulationGrowthGraphProps> = (props) => {
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
