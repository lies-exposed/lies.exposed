import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  ActorPageContent,
  type ActorPageContentProps,
} from "@liexp/ui/lib/components/ActorPageContent.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { type Meta } from "@storybook/react-vite";
import * as React from "react";

const meta = {
  title: "Components/Pages/ActorPageContent",
  component: ActorPageContent,
  render: ({ actor: { id }, ...props }) => {
    return (
      <QueriesRenderer
        queries={(Q) => ({
          actor: Q.Actor.get.useQuery({ id }),
          groups: Q.Group.list.useQuery(
            undefined,
            {
              members: [id],
              _sort: "createdAt",
              _order: "DESC",
            },
            false,
          ),
        })}
        render={({ actor, groups }) => {
          return (
            <MainContent>
              <ActorPageContent
                {...props}
                actor={actor.data}
                groups={groups.data}
              />
            </MainContent>
          );
        }}
      />
    );
  },
} as Meta<ActorPageContentProps>;

export default meta;

const ActorPageExample = {
  args: {
    id: "1bde0d49-03a1-411d-9f18-2e70a722532b" as UUID,
    groups: [],
    onGroupClick: () => {},
    onActorClick: () => {},
  },
};

export { ActorPageExample };
