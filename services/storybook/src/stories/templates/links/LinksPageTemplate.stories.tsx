import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery.js";
import {
  LinksPageTemplate,
  type LinksPageTemplateProps,
} from "@liexp/ui/lib/templates/links/LinksPageTemplate.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Links/Pages",
  component: LinksPageTemplate,
};

export default meta;

const Template: StoryFn<LinksPageTemplateProps> = (props) => {
  // const [tab, setTab] = React.useState(0);
  // const [q, setQ] = React.useState<SearchEventsQueryInputNoPagination>({
  //   hash: `query-${Math.random() * 100}`,
  // });

  return (
    <LinksPageTemplate
      filter={{
        pagination: { perPage: 10, page: 1 },
        filter: { search: "food" },
      }}
      onItemClick={() => {}}
      onFilterChange={() => {}}
      // onQueryChange={(q) => {
      //   setQ(q);
      // }}
      // onTabChange={setTab}
    />
  );
};

const DefaultTemplate = Template.bind({});

DefaultTemplate.args = {};

export { DefaultTemplate };
