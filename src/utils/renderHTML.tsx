import BubbleGraphExample from "@components/BubbleGraphExample"
import { CO2LevelsGraph } from "@components/CO2LevelsGraph"
import { CO2LeftBudgetCounter } from "@components/Counters/CO2LeftBudgetCounter"
import { WorldPopulationCounter } from "@components/Counters/WorldPopulationCount"
import { FullSizeSection } from "@components/FullSizeSection/FullSizeSection"
import NetworkExample from "@components/graph/NetworkExample"
import { MDXProvider, MDXProviderComponentsProp } from "@mdx-js/react"
import {
  HeadingXXLarge,
  ParagraphMedium,
} from "baseui/typography"
import { Link } from "gatsby"
import { MDXRenderer } from "gatsby-plugin-mdx"
import * as React from "react"

const shortcodes: MDXProviderComponentsProp = {
  Link,
  FullSizeSection,
  CO2LevelsGraph,
  CO2LeftBudgetCounter,
  WorldPopulationCounter,
  NetworkExample,
  BubbleGraphExample,
  h1: HeadingXXLarge,
  p: ParagraphMedium,
}

export const renderHTML = (md: {
  body: string
}): JSX.Element => (
  <MDXProvider components={shortcodes}>
    <MDXRenderer>{md.body}</MDXRenderer>
  </MDXProvider>
)
