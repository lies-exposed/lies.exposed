const path = require("path")

exports.createPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions
  const postTemplate = path.resolve(`src/templates/articleTemplate.tsx`)

  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        filter: { frontmatter: { path: { ne: "/articles" } } }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
            }
          }
        }
      }
    }
  `)

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  result.data.allMarkdownRemark.edges.forEach(({ node }) => {
    createPage({
      path: node.frontmatter.path,
      component: postTemplate,
      // additional data can be passed via context
      context: {
        filePath: node.frontmatter.path,
      },
    })
  })
}
