import { VaccineADRGraph } from "@econnessione/shared/components/Graph/covid/vaccines/VaccineADRGraph";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/covid/vaccines/VaccineADRGraph",
  component: VaccineADRGraph,
};

export default meta;

const Template: Story = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <VaccineADRGraph />
    </div>
  );
};

const VaccineADRGraphTemplate = Template.bind({});

const args = {};

VaccineADRGraphTemplate.args = args;

export { VaccineADRGraphTemplate as VaccineADRGraph };
