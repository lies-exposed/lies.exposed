import {
  KeywordPageContent,
  KeywordPageContentProps,
} from "@liexp/ui/components/KeywordPageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { keywordPageContentArgs } from "@liexp/ui/components/examples/KeywordPageContentExample";
import { useKeywordsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { Box } from "@mui/material";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/KeywordPageContent",
  component: KeywordPageContent,
};

export default meta;

const Template: Story<KeywordPageContentProps> = (props) => {
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
          <Box>
            <KeywordPageContent {...props} keyword={keywords[0]} />
          </Box>
        );
      }}
    />
  );
};

const KeywordPageContentExample = Template.bind({});

KeywordPageContentExample.args = {
  hierarchicalGraph: {
    onNodeClick(n) {},
    onLinkClick(l) {},
  },
};

export { KeywordPageContentExample };
