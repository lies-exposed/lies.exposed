import {
  TopicPageContent,
  TopicPageContentProps
} from "@econnessione/shared/components/TopicPageContent";
import { topicPageContentArgs } from "@econnessione/shared/components/examples/TopicPageContentExample";
import { Meta, Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Pages/TopicPageContent",
  component: TopicPageContent,
};

export default meta;

const Template: Story<TopicPageContentProps> = (props) => {
  return <TopicPageContent {...props} />;
};

const TopicPageContentExample = Template.bind({});

TopicPageContentExample.args = topicPageContentArgs;

export { TopicPageContentExample };
