import {
  WealthDistributionGraph,
  WealthDistributionGraphProps,
} from "@liexp/ui/components/Graph/WealthDistributionGraph/WealthDistributionGraph";
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
      <WealthDistributionGraph {...props} />
    </div>
  );
};

const WealthDistributionGraphExample = Template.bind({});

const args: WealthDistributionGraphProps = {};

WealthDistributionGraphExample.args = args;

export { WealthDistributionGraphExample as HumanPopulationGrowth };
