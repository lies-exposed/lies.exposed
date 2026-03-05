import {
  WealthDistributionGraph,
  type WealthDistributionGraphProps,
} from "@liexp/ui/lib/components/Graph/WealthDistributionGraph/WealthDistributionGraph.js";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import * as React from "react";

const meta = {
  title: "Components/Graph/WealthDistributionGraph",
  component: WealthDistributionGraph,
  render: (props) => {
    return (
      <div style={{ width: "100%" }}>
        <WealthDistributionGraph {...props} />
      </div>
    );
  },
} satisfies Meta<WealthDistributionGraphProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const WealthDistributionGraphExample: Story = { args: {} };

export { WealthDistributionGraphExample as HumanPopulationGrowth };
