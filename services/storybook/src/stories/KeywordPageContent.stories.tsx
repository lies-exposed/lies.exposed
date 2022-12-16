import {
  KeywordPageContent,
  type KeywordPageContentProps,
} from "@liexp/ui/components/KeywordPageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useKeywordsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { Box } from "@mui/material";
import { type Meta, type StoryFn as Story } from "@storybook/react";
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

KeywordPageContentExample.args = {};

export { KeywordPageContentExample };
