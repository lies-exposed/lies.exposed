import { Avatar, type AvatarProps } from "@liexp/ui/lib/components/Common/Avatar";
import { MainContent } from "@liexp/ui/lib/components/MainContent";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { useActorsQuery } from "@liexp/ui/lib/state/queries/actor.queries";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Common/Avatar",
  component: Avatar,
};

export default meta;

const Template: StoryFn<AvatarProps> = (props) => {
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
