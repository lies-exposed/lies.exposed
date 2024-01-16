import { VaccineADRGraph } from "@liexp/ui/lib/components/Graph/covid/vaccines/VaccineADRGraph.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/covid/vaccines/VaccineADRGraph",
  component: VaccineADRGraph,
};

export default meta;

const Template: StoryFn = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <VaccineADRGraph id="" distribution={[]} />
    </div>
  );
};

const VaccineADRGraphTemplate = Template.bind({});

const args = {};

VaccineADRGraphTemplate.args = args;

export { VaccineADRGraphTemplate as VaccineADRGraph };
