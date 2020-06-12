import { BlockQuote } from "@components/BlockQuote"
import { ListItem } from "@components/Common/ListItem"
import { FullSizeSection } from "@components/FullSizeSection/FullSizeSection"
import Gallery from "@components/Gallery/Gallery"
import { GraphSelector } from "@components/GraphSelector"
import {  H1, H2, H3, H5, H6, H4, ParagraphMedium } from "baseui/typography"
import * as React from "react"
import RehypeReact from "rehype-react"

const renderHTMLAST = new RehypeReact({
  createElement: React.createElement,
  components: {
    gallery: Gallery,
    h1: H1,
    h2: H2,
    h3: H3,
    h4: H4,
    h5: H5,
    h6: H6,
    li: ListItem,
    p: ParagraphMedium,
    blockquote: BlockQuote,
    // table: Table,
    "full-size-section": FullSizeSection,
    "graph-selector": GraphSelector,
  },
}).Compiler

export default renderHTMLAST
