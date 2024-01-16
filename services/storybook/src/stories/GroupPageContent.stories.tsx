import {
  GroupPageContent,
  type GroupPageContentProps,
} from "@liexp/ui/lib/components/GroupPageContent.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
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
      queries={(Q) => ({
        groups: Q.Group.list.useQuery(
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
          undefined,
          false,
        ),
      })}
      render={({ groups }) => {
        const group = groups.data[0];
        return (
          <QueriesRenderer
            queries={(Q) => ({
              groupsMembers: Q.GroupMember.list.useQuery(
                {
                  filter: {
                    group: group.id,
                  },
                },
                undefined,
                false,
              ),
            })}
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
