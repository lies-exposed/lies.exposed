import Header, { type HeaderProps } from "@liexp/ui/lib/components/Header/Header";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Header/Header",
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

const Template: StoryFn<HeaderProps> = (args) => {
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
      label: "Docs",
      view: "#docs",
      subItems: []
    },
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
        {
          label: "Groups",
          view: "#groups",
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
