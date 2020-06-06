import { BlockQuote } from "@components/BlockQuote"
import Gallery from "@components/Gallery/Gallery"
import { HumanPopulationGrowthGraph } from "@components/HumanPopulationGrowthGraph"
import {
  ParagraphLarge,
  HeadingXXLarge,
  HeadingMedium,
  HeadingXSmall,
  HeadingSmall,
  HeadingLarge,
  HeadingXLarge,
} from "baseui/typography"
import * as React from "react"
import RehypeReact from "rehype-react"

const renderHTMLAST = new RehypeReact({
  createElement: React.createElement,
  components: {
    gallery: Gallery,
    h1: HeadingXXLarge,
    h2: HeadingXLarge,
    h3: HeadingLarge,
    h4: HeadingMedium,
    h5: HeadingSmall,
    h6: HeadingXSmall,
    p: ParagraphLarge,
    blockquote: BlockQuote,
    "human-population-growth-graph": HumanPopulationGrowthGraph,
  },
}).Compiler

export default renderHTMLAST
