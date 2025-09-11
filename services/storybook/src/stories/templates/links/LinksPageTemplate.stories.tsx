import {
  LinksPageTemplate,
  type LinksPageTemplateProps,
} from "@liexp/ui/lib/templates/links/LinksPageTemplate.js";
import { type Meta } from "@storybook/react-vite";
import * as React from "react";

const meta = {
  title: "Templates/Links/Pages",
  component: LinksPageTemplate,
  render: () => {
    // const [tab, setTab] = React.useState(0);
    // const [q, setQ] = React.useState<SearchEventsQueryInputNoPagination>({
    //   hash: `query-${Math.random() * 100}`,
    // });

    return (
      <LinksPageTemplate
        filter={{
          q: "food",
        }}
        onItemClick={() => {}}
        onFilterChange={() => {}}
        // onQueryChange={(q) => {
        //   setQ(q);
        // }}
        // onTabChange={setTab}
      />
    );
  },
} satisfies Meta<LinksPageTemplateProps>;

export default meta;

const DefaultTemplate = { args: {} };

export { DefaultTemplate };
