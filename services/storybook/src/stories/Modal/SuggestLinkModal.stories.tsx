import SuggestLinkButton from "@liexp/ui/components/Common/Button/SuggestLinkButton";
import { SuggestLinkModal, type SuggestLinkModalProps } from "@liexp/ui/components/Modal/SuggestLinkModal";
import { type Meta, type Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta<SuggestLinkModalProps> = {
  title: "Components/Modal/SuggestLinkModal",
  component: SuggestLinkButton,
  argTypes: {},
};

export default meta;

const Template: Story<SuggestLinkModalProps> = ({ ...props }) => {

  return (
    <SuggestLinkButton />
  );
};

const SuggestLinkModalExample = Template.bind({});

SuggestLinkModalExample.args = {};

export { SuggestLinkModalExample };
