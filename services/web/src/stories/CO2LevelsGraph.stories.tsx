import {
  CO2LevelsGraph,
  CO2LevelsGraphProps,
} from "@components/Graph/CO2LevelsGraph";
import { Meta, Story } from "@storybook/react/types-6-0";
import { Block } from "baseui/block";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/CO2LevelsGraph",
  component: CO2LevelsGraph,
};

export default meta;

const Template: Story<CO2LevelsGraphProps> = (props) => {
  return (
    <Block overrides={{ Block: { style: { width: "100%" } } }}>
      <CO2LevelsGraph {...props} />
    </Block>
  );
};

const CO2LevelsGraphTemplate = Template.bind({});

const args: CO2LevelsGraphProps = {
  showPoints: true,
};

CO2LevelsGraphTemplate.args = args;

export { CO2LevelsGraphTemplate as CO2LevelsGraph };
