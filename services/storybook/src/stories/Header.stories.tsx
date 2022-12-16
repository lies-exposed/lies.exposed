import Header, { type HeaderProps } from "@liexp/ui/components/Header";
import { type Meta, type StoryFn as Story } from "@storybook/react";
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

const Template: Story<HeaderProps> = (args) => {
  const [p, setP] = React.useState("#explore");
  return (
    <Header
      {...args}
      pathname={p}
      onMenuItemClick={(m) => {
        setP(m.view);
      }}
    />
  );
};

export const HeaderExample = Template.bind({});
HeaderExample.args = {
  menu: [
    {
      label: "Explore",
      view: "#explore",
      subItems: [
        {
          label: "Events",
          view: "#events",
        },
        {
          label: "Actors",
          view: "#actors",
        },
      ],
    },
    {
      label: "Profile",
      view: "/profile",
      subItems: [
        {
          label: "Links",
          view: "#links",
        },
        {
          label: "Media",
          view: "#media",
        },
      ],
    },
  ],
};
