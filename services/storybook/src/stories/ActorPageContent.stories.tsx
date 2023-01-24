import {
  ActorPageContent,
  type ActorPageContentProps,
} from "@liexp/ui/components/ActorPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import {
  useActorQuery,
  useActorsQuery,
  useGroupsQuery,
} from "@liexp/ui/state/queries/DiscreteQueries";
import { type Meta, type Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/ActorPageContent",
  component: ActorPageContent,
};

export default meta;

const Template: Story<
  Omit<ActorPageContentProps, "actor"> & { id: string }
> = ({ id, ...props }) => {
  return (
    <QueriesRenderer
      queries={{
        actor: useActorQuery({ id }),
        groups: useGroupsQuery(
          {
            pagination: { perPage: 20, page: 1 },
            sort: { field: "createdAt", order: "DESC" },
            filter: { members: [id] },
          },
          false
        ),
      }}
      render={({ actor, groups }) => {
        return (
          <MainContent>
            <ActorPageContent {...props} actor={actor} groups={groups.data} />
          </MainContent>
        );
      }}
    />
  );
};

const ActorPageExample = Template.bind({});

ActorPageExample.args = {
  id: "1bde0d49-03a1-411d-9f18-2e70a722532b",
  groups: [],
  onGroupClick: () => {},
  onActorClick: () => {},
};

export { ActorPageExample };
