const path = require("path")

const createArticlePages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions
  const postTemplate = path.resolve(
    `src/templates/ArticleTemplate/ArticleTemplate.tsx`
  )

  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        filter: { fileAbsolutePath: { glob: "**/articles/**" } }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
            }
            fileAbsolutePath
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

const createTimelinePages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions
  const postTemplate = path.resolve(
    `src/templates/TimelineTemplate/TimelineTemplate.tsx`
  )

  const result = await graphql(`
    {
      allMarkdownRemark(
        sort: { order: DESC, fields: [frontmatter___date] }
        filter: { fileAbsolutePath: { glob: "**/timelines/**/index.md" } }
        limit: 1000
      ) {
        edges {
          node {
            frontmatter {
              path
            }
            fileAbsolutePath
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
    const fileDirGlob = `**/${path.dirname(
      path.relative(process.cwd(), node.fileAbsolutePath)
    )}/events/**`

    createPage({
      path: node.frontmatter.path,
      component: postTemplate,
      // additional data can be passed via context
      context: {
        URLPath: node.frontmatter.path,
        fileDirGlob,
      },
    })
  })
}

exports.createPages = async ({ actions, graphql, reporter }) => {
  await createArticlePages({ actions, graphql, reporter })
  await createTimelinePages({ actions, graphql, reporter })
}
