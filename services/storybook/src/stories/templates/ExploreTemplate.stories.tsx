import { EventType } from "@liexp/shared/io/http/Events";
import { formatDate } from "@liexp/shared/utils/date";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/state/queries/SearchEventsQuery";
import ExploreTemplate, {
  type ExploreTemplateProps,
} from "@liexp/ui/templates/ExploreTemplate";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Explore",
  component: ExploreTemplate,
};

export default meta;

const Template: StoryFn<ExploreTemplateProps> = (props) => {
  const [q, setQueryChange] =
    React.useState<SearchEventsQueryInputNoPagination>({
      hash: `query-${Math.random() * 100}`,
      startDate: undefined,
      endDate: formatDate(new Date()),
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
    <ExploreTemplate
      {...props}
      params={q}
      tab={tab}
      onQueryChange={(q, t) => {
        setQueryChange(q);
        setTab(t);
      }}
    />
  );
};

const ExploreTemplateDefault = Template.bind({});

ExploreTemplateDefault.args = {};

export { ExploreTemplateDefault };
