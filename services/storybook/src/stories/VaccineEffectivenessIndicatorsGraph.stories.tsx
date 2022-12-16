import { VaccineEffectivenessIndicators } from "@liexp/ui/components/Graph/covid/vaccines/VaccineEffectivenessIndicators";
import { type Meta, type StoryFn as Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Graph/covid/vaccines/VaccineEffectivenessIndicatorsGraph",
  component: VaccineEffectivenessIndicators,
};

export default meta;

const Template: Story = (props) => {
  return (
    <div style={{ width: "100%" }}>
      <VaccineEffectivenessIndicators />
    </div>
  );
};

const VaccineEffectivenessIndicatorsTemplate = Template.bind({});

const args = {};

VaccineEffectivenessIndicatorsTemplate.args = args;

export { VaccineEffectivenessIndicatorsTemplate as VaccineEffectivenessIndicators };
