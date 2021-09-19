import { firstTopic } from "@econnessione/shared/mock-data/topics";
import * as O from "fp-ts/lib/Option";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import { TopicPageContent, TopicPageContentProps } from "../TopicPageContent";

export const topicPageContentArgs: TopicPageContentProps = {
  id: "",
  frontmatter: firstTopic,
  body: "",
  tableOfContents: O.none,
  timeToRead: O.none,
};

export const TopicPageContentExample: React.FC<TopicPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as any)
    ? topicPageContentArgs
    : props;

  return <TopicPageContent {...pageContentProps} />;
};
