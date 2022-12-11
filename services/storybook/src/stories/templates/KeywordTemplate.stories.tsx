import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useKeywordsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import {
  KeywordTemplate,
  KeywordTemplateProps
} from "@liexp/ui/templates/KeywordTemplate";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Templates/Keyword/Page",
  component: KeywordTemplate,
};

export default meta;

const Template: Story<KeywordTemplateProps> = (props) => {
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
            onTabChange={setTab}
          />
        );
      }}
    />
  );
};

const KeywordTemplateDefault = Template.bind({});

KeywordTemplateDefault.args = {};

export { KeywordTemplateDefault };
