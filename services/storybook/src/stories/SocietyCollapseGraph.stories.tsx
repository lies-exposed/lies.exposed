import {
  SocietyCollapseForecastGraphContainer as SocietyCollapseForecastGraph,
  SocietyCollapseForecastGraphProps,
} from "@econnessione/ui/components/Graph/SocietyCollapseForecastGraph/SocietyCollapseForecastGraph";
import { Meta, Story } from "@storybook/react/types-6-0";
import React from "react";

const meta: Meta = {
  title: "Components/Graph/SocietyCollapseForecastGraph",
  component: SocietyCollapseForecastGraph,
  parameters: {
    docs: {
      description: {
        component: "Possible climate scenarios with collapse steps.",
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
