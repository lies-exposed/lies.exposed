import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import {
  KeywordTemplate,
  type KeywordTemplateProps,
} from "@liexp/ui/lib/templates/KeywordTemplate.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta<KeywordTemplateProps> = {
  title: "Templates/Keyword/Page",
  component: KeywordTemplate,
  args: {},
};

export default meta;

const Template: StoryFn<KeywordTemplateProps> = (props) => {
  const [q, setQueryChange] =
    React.useState<SearchEventsQueryInputNoPagination>({
      hash: `query-${Math.random() * 100}`,
      startDate: undefined,
      endDate: new Date().toDateString(),
      actors: [],
      groups: [],
      groupsMembers: [],
      media: [],
      locations: [],
      eventType: EventType.types.map((t) => t.value),
      _sort: "date",
      _order: "DESC",
    });
  const [tab, setTab] = React.useState(0);

  return (
    <QueriesRenderer
      queries={(Q) => ({
        keyword: Q.Keyword.list.useQuery(
          {
            pagination: { perPage: 10, page: 1 },
            filter: { q: "graphene" },
          },
          undefined,
          false,
        ),
      })}
      render={({ keyword: { data: keywords } }) => {
        return (
          <KeywordTemplate
            {...props}
            id={keywords[0].id}
            tab={tab}
            query={q}
            onTabChange={setTab}
            onQueryChange={setQueryChange}
          />
        );
      }}
    />
  );
};

const KeywordTemplateDefault = Template.bind({});

KeywordTemplateDefault.args = {};

export { KeywordTemplateDefault };
