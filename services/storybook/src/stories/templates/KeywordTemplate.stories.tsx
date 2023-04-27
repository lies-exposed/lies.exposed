import { EventType } from "@liexp/shared/lib/io/http/Events";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery";
import { useKeywordsQuery } from "@liexp/ui/lib/state/queries/keywords.queries";
import {
  KeywordTemplate,
  type KeywordTemplateProps,
} from "@liexp/ui/lib/templates/KeywordTemplate";
import { type Meta, type StoryFn as Story } from "@storybook/react";
import * as React from "react";

const meta: Meta<KeywordTemplateProps> = {
  title: "Templates/Keyword/Page",
  component: KeywordTemplate,
  args: {},
};

export default meta;

const Template: Story<KeywordTemplateProps> = (props) => {
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
      type: EventType.types.map((t) => t.value),
      _sort: "date",
      _order: "DESC",
    });
  const [tab, setTab] = React.useState(0);

  return (
    <QueriesRenderer
      queries={{
        keyword: useKeywordsQuery(
          {
            pagination: { perPage: 10, page: 1 },
            filter: { search: "graphene" },
          },
          false
        ),
      }}
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
