import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import ExploreTemplate, {
  type ExploreTemplateProps,
} from "@liexp/ui/lib/templates/ExploreTemplate.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Explore",
  component: ExploreTemplate,
};

export default meta;

const Template: StoryFn<ExploreTemplateProps> = (props) => {
  const [q, setQueryChange] =
    React.useState<SearchEventsQueryInputNoPagination>({
      hash: `query-${(Math.random() * 100).toString()}`,
      startDate: undefined,
      endDate: formatDate(new Date()),
      actors: [],
      groups: [],
      groupsMembers: [],
      media: [],
      locations: [],
      eventType: EventType.members.map((t) => t.literals[0]),
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
