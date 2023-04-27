import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery";
import { useActorsQuery } from "@liexp/ui/lib/state/queries/actor.queries";
import {
  ActorTemplate,
  type ActorTemplateProps,
} from "@liexp/ui/lib/templates/ActorTemplate";
import { type Meta, type StoryFn as Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Actor/Page",
  component: ActorTemplate,
  args: {},
};

export default meta;

const Template: Story<ActorTemplateProps> = (props) => {
  const [tab, setTab] = React.useState(props.tab ?? 0);
  const [q, setQ] = React.useState<SearchEventsQueryInputNoPagination>({
    hash: `query-${Math.random() * 100}`,
  });
  return (
    <>
      <QueriesRenderer
        queries={{
          actor: useActorsQuery(
            {
              pagination: { perPage: 10, page: 1 },
              filter: { ids: ["1bde0d49-03a1-411d-9f18-2e70a722532b"] },
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
              onQueryChange={(q) => {
                setQ(q);
              }}
            />
          );
        }}
      />
    </>
  );
};

const ActorTemplateDefault = Template.bind({});

ActorTemplateDefault.args = {
  tab: 2,
};

export { ActorTemplateDefault };
