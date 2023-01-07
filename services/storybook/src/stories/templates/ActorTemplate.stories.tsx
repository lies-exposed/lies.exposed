import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useActorsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { SearchEventsQueryInputNoPagination } from "@liexp/ui/state/queries/SearchEventsQuery";
import {
  ActorTemplate,
  ActorTemplateProps,
} from "@liexp/ui/templates/ActorTemplate";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Actor/Page",
  component: ActorTemplate,
};

export default meta;

const Template: Story<ActorTemplateProps> = (props) => {
  const [tab, setTab] = React.useState(0);
  const [q, setQ] = React.useState<SearchEventsQueryInputNoPagination>({
    hash: `query-${Math.random() * 100}`,
  });
  return (
    <QueriesRenderer
      queries={{
        actor: useActorsQuery(
          {
            pagination: { perPage: 10, page: 1 },
            filter: { search: "graphene" },
          },
          false
        ),
      }}
      render={({ actor: { data } }) => {
        return (
          <ActorTemplate
            {...props}
            actor={data[0]}
            tab={tab}
            onTabChange={setTab}
            query={q}
            onQueryChange={(q) => { setQ(q); }}
          />
        );
      }}
    />
  );
};

const ActorTemplateDefault = Template.bind({});

ActorTemplateDefault.args = {};

export { ActorTemplateDefault };
