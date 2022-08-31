import {
  GroupPageContent,
  GroupPageContentProps,
} from "@liexp/ui/components/GroupPageContent";
import { MainContent } from "@liexp/ui/components/MainContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import {
  useGroupsQuery,
  useGroupMembersQuery,
} from "@liexp/ui/state/queries/DiscreteQueries";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/GroupPageContent",
  component: GroupPageContent,
};

export default meta;

const Template: Story<GroupPageContentProps> = (props) => {
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
  hierarchicalGraph: {
    onNodeClick(n) {},
    onLinkClick(ll) {},
  },
};

export { GroupPageContentExample };
