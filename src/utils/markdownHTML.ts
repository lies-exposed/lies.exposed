import rehype from "rehype"
import remark from "remark"
import remarkHTML from "remark-html"

export const MDtoHTML = (value: string): string =>
  remark()
    .use(remarkHTML)
    .processSync(value)
    .toString()

export const HTMLtoAST = rehype().parse
