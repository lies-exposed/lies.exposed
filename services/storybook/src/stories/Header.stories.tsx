import Header, { HeaderProps } from "@liexp/ui/components/Header";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Header",
  component: Header,
  parameters: {
    docs: {
      description: {
        component: "The web app Header",
      },
    },
  },
};
export default meta;

const Template: Story<HeaderProps> = (args) => <Header {...args} />;

export const HeaderExample = Template.bind({});
HeaderExample.args = {
  menu: [
    {
      label: "Profile",
      view: "/profile",
      subItems: [],
    },
  ],
};
