import SuggestLinkButton, {
  type SuggestLinkButtonProps,
} from "@liexp/ui/lib/components/Common/Button/SuggestLinkButton.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta<SuggestLinkButtonProps> = {
  title: "Components/Modal/SuggestLinkModal",
  component: SuggestLinkButton,
  argTypes: {},
};

export default meta;

const Template: StoryFn<SuggestLinkButtonProps> = () => {
  return <SuggestLinkButton />;
};

const SuggestLinkModalExample = Template.bind({});

SuggestLinkModalExample.args = {};

export { SuggestLinkModalExample };
