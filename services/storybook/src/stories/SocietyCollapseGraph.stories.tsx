import {
  SocietyCollapseForecastGraphContainer as SocietyCollapseForecastGraph,
  SocietyCollapseForecastGraphProps
} from "@econnessione/shared/components/Graph/SocietyCollapseForecastGraph/SocietyCollapseForecastGraph";
import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";

const meta: Meta = {
  title: "Components/Graph/SocietyCollapseForecastGraph",
  component: SocietyCollapseForecastGraph,
  parameters: {
    docs: {
      description: {
        component:
          "Based on [Bilevel Edge Bundling](https://observablehq.com/@d3/bilevel-edge-bundling?collection=@d3/d3-hierarchy)",
      },
    },
  },
};
export default meta;

const Template: Story<SocietyCollapseForecastGraphProps> = (args) => (
  <SocietyCollapseForecastGraph {...args} />
);

export const SocietyCollapseForecastGraphExample = Template.bind({});

SocietyCollapseForecastGraphExample.args = {};
