import { type SearchEventsQueryInputNoPagination } from "@liexp/ui/lib/state/queries/SearchEventsQuery";
import {
  LinksPageTemplate,
  type LinksPageTemplateProps,
} from "@liexp/ui/lib/templates/links/LinksPageTemplate";
import { type Meta, type StoryFn as Story } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Links/Pages",
  component: LinksPageTemplate,
};

export default meta;

const Template: Story<LinksPageTemplateProps> = (props) => {
  // const [tab, setTab] = React.useState(0);
  // const [q, setQ] = React.useState<SearchEventsQueryInputNoPagination>({
  //   hash: `query-${Math.random() * 100}`,
  // });

  return (
    <LinksPageTemplate
      params={{
        pagination: { perPage: 10, page: 1 },
        filter: { name: "food" },
      }}
      onItemClick={() => {}}
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
