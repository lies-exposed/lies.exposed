import {
  AxisGraph,
  AxisGraphProps,
} from "@liexp/ui/components/Common/Graph/AxisGraph";
import { Story, Meta } from "@storybook/react/types-6-0";
import React from "react";

const meta: Meta = {
  title: "Components/Graph/AxisGraph",
  component: AxisGraph,
  parameters: {
    docs: {
      description: {
        component: "Generic component to display axis graph",
      },
    },
  },
};
export default meta;

const Template: Story<AxisGraphProps<any>> = (args) => <AxisGraph {...args} />;

export const AxisGraphExample = Template.bind({});
AxisGraphExample.args = {
  width: 600,
  data: [],
};
