import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery";
import { useGroupsQuery } from "@liexp/ui/lib/state/queries/groups.queries";
import {
  GroupTemplate,
  type GroupTemplateProps,
} from "@liexp/ui/lib/templates/GroupTemplate";
import { type Meta, type StoryFn as Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Group/Page",
  component: GroupTemplate,
};

export default meta;

const Template: Story<GroupTemplateProps> = (props) => {
  const [tab, setTab] = React.useState(0);
  const [q, setQ] = React.useState<SearchEventsQueryInputNoPagination>({
    hash: `query-${Math.random() * 100}`,
  });

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
            query={q}
            onQueryChange={(q) => { setQ(q); }}
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
