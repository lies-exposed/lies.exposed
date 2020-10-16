import { BlockQuote } from "@components/BlockQuote"
import BubbleGraphExample from "@components/BubbleGraphExample"
import { ListItem } from "@components/Common/ListItem"
import { CO2LeftBudgetCounter } from "@components/Counters/CO2LeftBudgetCounter"
import { WorldPopulationCounter } from "@components/Counters/WorldPopulationCount"
import { FullSizeSection } from "@components/FullSizeSection/FullSizeSection"
import { CO2LevelsGraph } from "@components/Graph/CO2LevelsGraph"
import { HumanPopulationGrowthGraph } from "@components/Graph/HumanPopulationGrowthGraph"
import NetworkExample from "@components/Graph/NetworkExample"
import { Video } from "@components/Video"
import { MDXProvider, MDXProviderComponentsProp } from "@mdx-js/react"
import { HeadingLarge, HeadingMedium, HeadingSmall, HeadingXLarge, HeadingXSmall, HeadingXXLarge, ParagraphMedium } from "baseui/typography"
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
  blockquote: BlockQuote,
  h1: HeadingXXLarge,
  h2: HeadingXLarge,
  h3: HeadingLarge,
  h4: HeadingMedium,
  h5: HeadingSmall,
  h6: HeadingXSmall
}

export const renderHTML = (md: { body: string | null }): JSX.Element => (
  <MDXProvider components={shortcodes}>
    { md.body !== null ? <MDXRenderer>{md.body}</MDXRenderer> : "No body given"}
  </MDXProvider>
)
