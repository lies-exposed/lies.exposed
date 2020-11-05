import { BlockQuote } from "@components/BlockQuote"
import { ListItem } from "@components/Common/ListItem"
import { CO2LeftBudgetCounter } from "@components/Counters/CO2LeftBudgetCounter"
import { WorldPopulationCounter } from "@components/Counters/WorldPopulationCount"
import { FullSizeSection } from "@components/FullSizeSection/FullSizeSection"
import { GQLVoyager } from "@components/GQLVoyager"
import { CO2LevelsGraph } from "@components/Graph/CO2LevelsGraph"
import { HumanPopulationGrowthGraph } from "@components/Graph/HumanPopulationGrowthGraph"
import { Video } from "@components/Video/Video"
import { ActorPageContentExample } from "@components/examples/ActorPageContentExample"
import BubbleGraphExample from "@components/examples/BubbleGraphExample"
import { EventPageContentExample } from "@components/examples/EventPageContentExample"
import { EventSliderExample } from "@components/examples/EventSliderExample"
import { GroupPageContentExample } from "@components/examples/GroupPageContentExample"
import NetworkExample from "@components/examples/NetworkExample"
import { ProjectPageContentExample } from "@components/examples/ProjectPageContentExample"
import { TopicPageContentExample } from "@components/examples/TopicPageContentExample"
import { MDXProvider, MDXProviderComponentsProp } from "@mdx-js/react"
import {
  HeadingLarge,
  HeadingMedium,
  HeadingSmall,
  HeadingXLarge,
  HeadingXSmall,
  HeadingXXLarge,
  ParagraphMedium,
} from "baseui/typography"
import { MDXRenderer } from "gatsby-plugin-mdx"
import * as React from "react"

const shortcodes: MDXProviderComponentsProp = {
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
  EventSliderExample,
  // components
  FullSizeSection,
  Video,
  GQLVoyager,
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
}

export const renderHTML = (md: { body: string | null }): JSX.Element => (
  <MDXProvider components={shortcodes}>
    {md.body !== null ? <MDXRenderer>{md.body}</MDXRenderer> : null}
  </MDXProvider>
)
