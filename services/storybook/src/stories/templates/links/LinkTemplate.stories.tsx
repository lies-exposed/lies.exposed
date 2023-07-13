import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import {
  defaultGetLinksQueryParams,
  useLinksQuery,
} from "@liexp/ui/lib/state/queries/link.queries";
import {
  LinkTemplateUI,
  type LinkTemplateUIProps,
} from "@liexp/ui/lib/templates/links/LinkTemplateUI";
import { type StoryFn, type Meta } from "@storybook/react";
import * as React from "react";

const meta: Meta<LinkTemplateUIProps> = {
  title: "Templates/Links/Page",
  component: LinkTemplateUI,
};

export default meta;

const Template: StoryFn<LinkTemplateUIProps> = (props) => {
  const [tab, setTab] = React.useState(0);
  // const [q, setQ] = React.useState<SearchEventsQueryInputNoPagination>({
  //   hash: `query-${Math.random() * 100}`,
  // });

  return (
    <QueriesRenderer
      queries={{
        links: useLinksQuery(
          {
            ...defaultGetLinksQueryParams,
            pagination: {
              ...defaultGetLinksQueryParams.pagination,
              perPage: 3,
            },
          },
          false,
        ),
      }}
      render={({
        links: {
          data: [, , link],
        },
      }) => {
        return (
          <LinkTemplateUI
            link={link}
            onEventClick={() => {}}
            onKeywordClick={() => {}}
            tab={tab}
            // onQueryChange={(q) => {
            //   setQ(q);
            // }}
            onTabChange={setTab}
          />
        );
      }}
    />
  );
};

const DefaultTemplate = Template.bind({});

DefaultTemplate.args = {};

export { DefaultTemplate };
