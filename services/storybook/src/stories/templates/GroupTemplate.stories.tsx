import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useGroupsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/state/queries/SearchEventsQuery";
import {
  GroupTemplate,
  type GroupTemplateProps,
} from "@liexp/ui/templates/GroupTemplate";
import { type Meta, type Story } from "@storybook/react/types-6-0";
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
