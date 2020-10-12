import { BlockQuote } from "@components/BlockQuote"
import BubbleGraphExample from "@components/BubbleGraphExample"
import { CO2LevelsGraph } from "@components/CO2LevelsGraph"
import { ListItem } from "@components/Common/ListItem"
import { CO2LeftBudgetCounter } from "@components/Counters/CO2LeftBudgetCounter"
import { WorldPopulationCounter } from "@components/Counters/WorldPopulationCount"
import { FullSizeSection } from "@components/FullSizeSection/FullSizeSection"
import { HumanPopulationGrowthGraph } from "@components/Graph/HumanPopulationGrowthGraph"
import NetworkExample from "@components/Graph/NetworkExample"
import { Video } from "@components/Video"
import { MDXProvider, MDXProviderComponentsProp } from "@mdx-js/react"
import { ParagraphMedium } from "baseui/typography"
import { Link } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import * as React from "react"

const shortcodes: MDXProviderComponentsProp = {
  Link,
  FullSizeSection,
  CO2LevelsGraph,
  CO2LeftBudgetCounter,
  HumanPopulationGrowthGraph: HumanPopulationGrowthGraph,
  WorldPopulationCounter,
  NetworkExample,
  BubbleGraphExample,
  Video: Video,
  p: ParagraphMedium,
  li: ListItem,
  blockquote: BlockQuote
}

export const renderHTML = (md: { body: string }): JSX.Element => (
  <MDXProvider components={shortcodes}>
    <MDXRenderer>{md.body}</MDXRenderer>
  </MDXProvider>
)
