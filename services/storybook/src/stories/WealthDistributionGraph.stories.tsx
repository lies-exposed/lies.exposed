import {
  WealthDistributionGraph,
  type WealthDistributionGraphProps,
} from "@liexp/ui/lib/components/Graph/WealthDistributionGraph/WealthDistributionGraph.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/WealthDistributionGraph",
  component: WealthDistributionGraph,
};

export default meta;

const Template: StoryFn<WealthDistributionGraphProps> = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <WealthDistributionGraph {...props} />
    </div>
  );
};

const WealthDistributionGraphExample = Template.bind({});

const args: WealthDistributionGraphProps = {};

WealthDistributionGraphExample.args = args;

export { WealthDistributionGraphExample as HumanPopulationGrowth };
