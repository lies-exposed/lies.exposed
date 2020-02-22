import {
  ParagraphMedium,
  HeadingXXLarge,
  HeadingMedium,
  HeadingXSmall,
  HeadingSmall,
  HeadingLarge,
  HeadingXLarge,
} from "baseui/typography"
import * as React from "react"
import RehypeReact from "rehype-react"
import { BlockQuote } from "../components/BlockQuote"
import Gallery from "../components/Gallery/Gallery"

const renderMarkdownAST = new RehypeReact({
  createElement: React.createElement,
  components: {
    gallery: Gallery,
    h1: HeadingXXLarge,
    h2: HeadingXLarge,
    h3: HeadingLarge,
    h4: HeadingMedium,
    h5: HeadingSmall,
    h6: HeadingXSmall,
    p: ParagraphMedium,
    blockquote: BlockQuote,
  },
}).Compiler

export default renderMarkdownAST
