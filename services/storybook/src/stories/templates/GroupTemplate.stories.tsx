import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import {
  useGroupsQuery,
} from "@liexp/ui/state/queries/DiscreteQueries";
import {
  GroupTemplate,
  GroupTemplateProps,
} from "@liexp/ui/templates/GroupTemplate";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Group/Page",
  component: GroupTemplate,
};

export default meta;

const Template: Story<GroupTemplateProps> = (props) => {
  const [tab, setTab] = React.useState(0);

  return (
    <QueriesRenderer
      queries={{
        groups: useGroupsQuery(
          {
            pagination: { perPage: 10, page: 1 },
            filter: { name: "food" },
          },
          false
        ),
      }}
      render={({ groups: { data } }) => {
        return (
          <GroupTemplate
            {...props}
            group={data[0]}
            tab={tab}
            onTabChange={setTab}
          />
        );
      }}
    />
  );
};

const GroupTemplateDefault = Template.bind({});

GroupTemplateDefault.args = {};

export { GroupTemplateDefault };
