import {
  WealthDistributionGraph,
  WealthDistributionGraphProps,
} from "@econnessione/shared/components/Graph/WealthDistributionGraph";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/WealthDistributionGraph",
  component: WealthDistributionGraph,
};

export default meta;

const Template: Story<WealthDistributionGraphProps> = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <h2>Global Wealth Distribution</h2>
      <WealthDistributionGraph {...props} />
    </div>
  );
};

const WealthDistributionGraphExample = Template.bind({});

const args: WealthDistributionGraphProps = {};

WealthDistributionGraphExample.args = args;

export { WealthDistributionGraphExample as HumanPopulationGrowth };
