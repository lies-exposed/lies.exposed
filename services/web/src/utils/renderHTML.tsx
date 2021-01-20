/* eslint-disable @typescript-eslint/no-var-requires */
import { BlockQuote } from "@components/BlockQuote";
import { ListItem } from "@components/Common/ListItem";
import { CO2LeftBudgetCounter } from "@components/Counters/CO2LeftBudgetCounter";
import { WorldPopulationCounter } from "@components/Counters/WorldPopulationCount";
import { FullSizeSection } from "@components/FullSizeSection/FullSizeSection";
// import { GQLVoyager } from "@components/GQLVoyager"
import { CO2LevelsGraph } from "@components/Graph/CO2LevelsGraph";
import { HumanPopulationGrowthGraph } from "@components/Graph/HumanPopulationGrowthGraph";
import { MainContent } from "@components/MainContent";
import { Video } from "@components/Video/Video";
import { ActorPageContentExample } from "@components/examples/ActorPageContentExample";
import BubbleGraphExample from "@components/examples/BubbleGraphExample";
import { EventPageContentExample } from "@components/examples/EventPageContentExample";
import { EventSliderExample } from "@components/examples/EventSliderExample";
import { GroupPageContentExample } from "@components/examples/GroupPageContentExample";
import NetworkExample from "@components/examples/NetworkExample";
import { ProjectPageContentExample } from "@components/examples/ProjectPageContentExample";
import { TopicPageContentExample } from "@components/examples/TopicPageContentExample";
import { MDXProviderComponentsProp } from "@mdx-js/react";
import {
  DisplayLarge,
  DisplayMedium,
  DisplaySmall,
  DisplayXSmall,
  HeadingLarge,
  HeadingMedium,
  HeadingSmall,
  HeadingXLarge,
  HeadingXSmall,
  HeadingXXLarge,
  ParagraphMedium,
} from "baseui/typography";
// import { MDXRenderer } from "gatsby-plugin-mdx"
import * as React from "react";
const MDX = require("@mdx-js/runtime");

export const components: MDXProviderComponentsProp = {
  // layout
  MainContent,
  // counters
  CO2LeftBudgetCounter,
  WorldPopulationCounter,
  // graphs
  CO2LevelsGraph,
  HumanPopulationGrowthGraph,
  // graph examples
  NetworkExample,
  BubbleGraphExample,
  // page content examples
  ActorPageContentExample,
  GroupPageContentExample,
  ProjectPageContentExample,
  TopicPageContentExample,
  EventPageContentExample,
  // EventSliderExample,
  // components
  DisplayXSmall,
  DisplaySmall,
  DisplayMedium,
  DisplayLarge,
  FullSizeSection,
  Video,
  // GQLVoyager,
  // common tags
  p: ParagraphMedium,
  li: ListItem,
  blockquote: BlockQuote,
  h1: HeadingXXLarge,
  h2: HeadingXLarge,
  h3: HeadingLarge,
  h4: HeadingMedium,
  h5: HeadingSmall,
  h6: HeadingXSmall,
};

export const RenderHTML: React.FC = ({ children }): JSX.Element => {
  // eslint-disable-next-line no-console
  console.log(children);
  // eslint-disable-next-line react/no-children-prop
  return <MDX components={components} children={null} />;
};
