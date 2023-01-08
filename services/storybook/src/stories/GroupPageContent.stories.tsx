import {
  GroupPageContent,
  type GroupPageContentProps,
} from "@liexp/ui/lib/components/GroupPageContent";
import { MainContent } from "@liexp/ui/lib/components/MainContent";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import {
  useGroupMembersQuery,
} from "@liexp/ui/lib/state/queries/DiscreteQueries";
import {
  useGroupsQuery,
} from "@liexp/ui/lib/state/queries/groups.queries";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/GroupPageContent",
  component: GroupPageContent,
};

export default meta;

const Template: StoryFn<GroupPageContentProps> = (props) => {
  return (
    <QueriesRenderer
      queries={{
        groups: useGroupsQuery(
          {
            filter: {},
            pagination: {
              perPage: 1,
              page: 1,
            },
            sort: {
              field: "createdAt",
              order: "DESC",
            },
          },
          false
        ),
      }}
      render={({ groups }) => {
        const group = groups.data[0];
        return (
          <QueriesRenderer
            queries={{
              groupsMembers: useGroupMembersQuery(
                {
                  filter: {
                    group: group.id,
                  },
                },
                false
              ),
            }}
            render={({ groupsMembers }) => {
              return (
                <MainContent>
                  <GroupPageContent
                    {...props}
                    group={group}
                    groupsMembers={groupsMembers.data}
                  />
                </MainContent>
              );
            }}
          />
        );
      }}
    />
  );
};

const GroupPageContentExample = Template.bind({});

GroupPageContentExample.args = {
  ownedGroups: [],
};

export { GroupPageContentExample };
