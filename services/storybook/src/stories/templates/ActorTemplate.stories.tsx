import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import {
  ActorTemplate,
  type ActorTemplateProps,
} from "@liexp/ui/lib/templates/ActorTemplate.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Actor/Page",
  component: ActorTemplate,
  args: {},
};

export default meta;

const Template: StoryFn<ActorTemplateProps> = (props) => {
  const [tab, setTab] = React.useState(props.tab);
  const [q, setQ] = React.useState<SearchEventsQueryInputNoPagination>({
    hash: `query-${(Math.random() * 100).toString()}`,
  });
  return (
    <>
      <QueriesRenderer
        queries={(Q) => ({
          actor: Q.Actor.list.useQuery(
            undefined,
            {
              ids: ["1bde0d49-03a1-411d-9f18-2e70a722532b"],
              _end: "10",
            },
            false,
          ),
        })}
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
