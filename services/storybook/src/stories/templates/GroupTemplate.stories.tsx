import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import {
  GroupTemplate,
  type GroupTemplateProps,
} from "@liexp/ui/lib/templates/GroupTemplate.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Group/Page",
  component: GroupTemplate,
};

export default meta;

const Template: StoryFn<GroupTemplateProps> = (props) => {
  const [tab, setTab] = React.useState(0);
  const [q, setQ] = React.useState<SearchEventsQueryInputNoPagination>({
    hash: `query-${Math.random() * 100}`,
  });

  return (
    <QueriesRenderer
      queries={(Q) => ({
        groups: Q.Group.list.useQuery(
          {
            pagination: { perPage: 10, page: 1 },
            filter: { name: "food" },
          },
          undefined,
          false,
        ),
      })}
      render={({ groups: { data } }) => {
        return (
          <GroupTemplate
            {...props}
            group={data[0]}
            tab={tab}
            query={q}
            onQueryChange={(q) => {
              setQ(q);
            }}
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
