import {
  SocietyCollapseForecastGraphContainer as SocietyCollapseForecastGraph,
  type SocietyCollapseForecastGraphProps,
} from "@liexp/ui/components/Graph/SocietyCollapseForecastGraph/SocietyCollapseForecastGraph";
import { type Meta, type StoryFn as Story } from "@storybook/react";
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
