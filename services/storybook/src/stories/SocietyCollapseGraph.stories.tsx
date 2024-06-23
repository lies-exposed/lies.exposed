import {
  SocietyCollapseForecastGraphContainer as SocietyCollapseForecastGraph,
  type SocietyCollapseForecastGraphProps,
} from "@liexp/ui/lib/components/Graph/SocietyCollapseForecastGraph/SocietyCollapseForecastGraph.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

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

const Template: StoryFn<SocietyCollapseForecastGraphProps> = (args) => (
  <SocietyCollapseForecastGraph {...args} />
);

export const SocietyCollapseForecastGraphExample = Template.bind({});

SocietyCollapseForecastGraphExample.args = {};
