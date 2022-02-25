import {
  KeywordPageContent,
  KeywordPageContentProps,
} from "@liexp/ui/components/KeywordPageContent";
import { keywordPageContentArgs } from "@liexp/ui/components/examples/KeywordPageContentExample";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/KeywordPageContent",
  component: KeywordPageContent,
};

export default meta;

const Template: Story<KeywordPageContentProps> = (props) => {
  return <KeywordPageContent {...props} />;
};

const KeywordPageContentExample = Template.bind({});

KeywordPageContentExample.args = keywordPageContentArgs;

export { KeywordPageContentExample };
