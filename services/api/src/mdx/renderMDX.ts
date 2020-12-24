// eslint-disable-next-line @typescript-eslint/no-var-requires
const genMDX = require("gatsby-plugin-mdx/utils/gen-mdx")

export const renderMDX = async (mdxCode: string, frontmatter: object): Promise<string> => {
  try {
    const mdxNode = await genMDX({
      content: mdxCode,
      cache: { get: () => undefined, set: () => undefined },
      isLoader: false,
      node: { internal: { contentDigest: "fake" }, rawBody: mdxCode },
      options: {
        remarkPlugins: [
          require('remark-footnotes'),
          require('remark-numbered-footnote-labels'),
          require('@remark-embedder/core'),
          require('remark-images'),
          require('remark-mermaid')
        ],
        rehypePlugins: [],
        gatsbyRemarkPlugins: [],
      },
      getNode: () => undefined,
      getNodes: () => [],
      getNodesByType: () => [],
      pathPrefix: "./",
    })
    return mdxNode.body
  } catch (e) {
    console.error(e)
    return e
  }

  // const code = `${mdxCode}
  //   export const _frontmatter = ${JSON.stringify(frontmatter)}
  // `

  // const jsxCode = await mdx(code, { remarkPlugins: [] })

  // console.log({ jsxCode })
  // const transformedCode = transform(jsxCode)
  // console.log({ transformedCode })
  // return `
  //   ${transformedCode}
  // `
}
