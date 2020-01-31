import * as React from "react"
import RehypeReact from "rehype-react"
import Gallery from "../components/Gallery/Gallery"

const renderMarkdownAST = new RehypeReact({
  createElement: React.createElement,
  components: {
    gallery: Gallery,
  },
}).Compiler

export default renderMarkdownAST
