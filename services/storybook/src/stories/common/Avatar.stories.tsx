import { Avatar, type AvatarProps } from "@liexp/ui/components/Common/Avatar";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useActorsQuery } from "@liexp/ui/state/queries/actor.queries";
import { type Meta, type Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Common/Avatar",
  component: Avatar,
};

export default meta;

const Template: Story<AvatarProps> = (props) => {
  return (
    <QueriesRenderer
      queries={{ actors: useActorsQuery({}, false) }}
      render={({ actors }) => {
        const actor = actors.data[0];
        return (
          <MainContent>
            <Avatar {...props} src={actor.avatar} />
          </MainContent>
        );
      }}
    />
  );
};

const AvatarExample = Template.bind({});

AvatarExample.args = {
  size: "xlarge",
};

export { AvatarExample };
