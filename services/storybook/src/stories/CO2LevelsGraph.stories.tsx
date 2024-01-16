import {
  CO2LevelsGraph,
  type CO2LevelsGraphProps,
} from "@liexp/ui/lib/components/Graph/CO2LevelsGraph.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/CO2LevelsGraph",
  component: CO2LevelsGraph,
};

export default meta;

const Template: StoryFn<CO2LevelsGraphProps> = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <CO2LevelsGraph {...props} />
    </div>
  );
};

const CO2LevelsGraphTemplate = Template.bind({});

const args: CO2LevelsGraphProps = {
  showPoints: true,
};

CO2LevelsGraphTemplate.args = args;

export { CO2LevelsGraphTemplate as CO2LevelsGraph };
