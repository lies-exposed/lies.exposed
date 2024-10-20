import {
  KeywordPageContent,
  type KeywordPageContentProps,
} from "@liexp/ui/lib/components/KeywordPageContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { Box } from "@liexp/ui/lib/components/mui/index.js";
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
      queries={(Q) => ({
        keyword: Q.Keyword.list.useQuery(
          {
            pagination: { perPage: 10, page: 1 },
            filter: { q: "graphene" },
          },
          undefined,
          false,
        ),
      })}
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
