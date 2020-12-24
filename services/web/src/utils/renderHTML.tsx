import { BlockQuote } from "@components/BlockQuote"
import { ListItem } from "@components/Common/ListItem"
import { CO2LeftBudgetCounter } from "@components/Counters/CO2LeftBudgetCounter"
import { WorldPopulationCounter } from "@components/Counters/WorldPopulationCount"
import { ActorPageContentExample } from "@components/examples/ActorPageContentExample"
import BubbleGraphExample from "@components/examples/BubbleGraphExample"
import { EventPageContentExample } from "@components/examples/EventPageContentExample"
import { EventSliderExample } from "@components/examples/EventSliderExample"
import { GroupPageContentExample } from "@components/examples/GroupPageContentExample"
import NetworkExample from "@components/examples/NetworkExample"
import { ProjectPageContentExample } from "@components/examples/ProjectPageContentExample"
import { TopicPageContentExample } from "@components/examples/TopicPageContentExample"
import { FullSizeSection } from "@components/FullSizeSection/FullSizeSection"
import { GQLVoyager } from "@components/GQLVoyager"
import { CO2LevelsGraph } from "@components/Graph/CO2LevelsGraph"
import { HumanPopulationGrowthGraph } from "@components/Graph/HumanPopulationGrowthGraph"
import { Video } from "@components/Video/Video"
import { MDXProvider, MDXProviderComponentsProp } from "@mdx-js/react"
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
  ParagraphMedium
} from "baseui/typography"
import { MDXRenderer } from "gatsby-plugin-mdx"
import * as React from "react"


export const shortcodes: MDXProviderComponentsProp = {
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
  DisplayXSmall,
  DisplaySmall,
  DisplayMedium,
  DisplayLarge,
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

export const renderHTML = (md: { body: string | null }): JSX.Element => {
  return (
    <MDXProvider components={shortcodes}>
      {md.body !== null ? (
        typeof md.body === "string" && md.body.length > 0 ? (
          <MDXRenderer>{md.body}</MDXRenderer>
        ) : (
          md.body
        )
      ) : null}
    </MDXProvider>
  )
}
