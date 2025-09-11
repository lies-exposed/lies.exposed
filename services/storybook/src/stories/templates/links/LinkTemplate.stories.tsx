import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import {
  LinkTemplateUI,
  type LinkTemplateUIProps,
} from "@liexp/ui/lib/templates/links/LinkTemplateUI.js";
import { type StoryFn, type Meta } from "@storybook/react-vite";
import * as React from "react";

const meta = {
  title: "Templates/Links/Page",
  component: LinkTemplateUI,
} satisfies Meta<LinkTemplateUIProps>;

export default meta;

const Template: StoryFn<LinkTemplateUIProps> = () => {
  const [tab, setTab] = React.useState(0);
  // const [q, setQ] = React.useState<SearchEventsQueryInputNoPagination>({
  //   hash: `query-${Math.random() * 100}`,
  // });

  return (
    <QueriesRenderer
      queries={(Q) => ({
        links: Q.Link.list.useQuery(
          undefined,
          {
            _end: "3",
          },
          false,
        ),
      })}
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
