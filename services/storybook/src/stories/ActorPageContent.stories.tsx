import {
  ActorPageContent,
  ActorPageContentProps,
} from "@liexp/ui/components/ActorPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { actorPageContentArgs } from "@liexp/ui/components/examples/ActorPageContentExample";
import { useActorsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/ActorPageContent",
  component: ActorPageContent,
};

export default meta;

const Template: Story<ActorPageContentProps> = (props) => {
  return (
    <QueriesRenderer
      queries={{ actors: useActorsQuery({}, false) }}
      render={({ actors }) => {
        const actor = actors.data[0];
        return (
          <MainContent>
            <ActorPageContent {...props} {...actor} />
          </MainContent>
        );
      }}
    />
  );
};

const ActorPageExample = Template.bind({});

ActorPageExample.args = actorPageContentArgs;

export { ActorPageExample };
