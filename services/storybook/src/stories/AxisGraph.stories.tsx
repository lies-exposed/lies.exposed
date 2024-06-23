import { fc } from "@liexp/test";
import {
  AxisGraph,
  type AxisGraphProps,
} from "@liexp/ui/lib/components/Common/Graph/AxisGraph.js";
import { type Meta, type StoryFn } from "@storybook/react";
import { LinearGradient } from "@visx/gradient";
import * as React from "react";

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

const Template: StoryFn<AxisGraphProps<any>> = (args) => (
  <AxisGraph {...args} />
);

export const AxisGraphExample = Template.bind({});
AxisGraphExample.args = {
  width: 600,
  height: 300,
  margin: { top: 10, left: 10, right: 10, bottom: 10 },
  getX: (n) => n.x,
  getY: (n) => n.y,
  minXRange: 0,
  minYRange: 0,
  background: (id) => {
    return (
      <LinearGradient
        id={id}
        vertical={true}
        fromOpacity={1}
        toOpacity={1}
        to="#34e56a"
        from="#123de6"
        fromOffset="40%"
        toOffset="80%"
      />
    );
  },
  linePathElement: (id) => {
    return (
      <LinearGradient
        id={id}
        vertical={true}
        fromOpacity={1}
        toOpacity={1}
        to="#fcc317"
        from="#fc2317"
        fromOffset="40%"
        toOffset="80%"
      />
    );
  },
  data: fc
    .sample(fc.record({ x: fc.nat(), y: fc.nat() }))
    .sort((a, b) => a.x - b.x),
};
