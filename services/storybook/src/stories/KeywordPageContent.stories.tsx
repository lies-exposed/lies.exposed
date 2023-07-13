import {
  KeywordPageContent,
  type KeywordPageContentProps,
} from "@liexp/ui/lib/components/KeywordPageContent";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { Box } from "@liexp/ui/lib/components/mui";
import { useKeywordsQuery } from "@liexp/ui/lib/state/queries/keywords.queries";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/KeywordPageContent",
  component: KeywordPageContent,
};

export default meta;

const Template: StoryFn<KeywordPageContentProps> = (props) => {
  return (
    <QueriesRenderer
      queries={{
        keyword: useKeywordsQuery(
          {
            pagination: { perPage: 10, page: 1 },
            filter: { search: "graphene" },
          },
          false,
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
