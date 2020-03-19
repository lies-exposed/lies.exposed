const path = require("path")
const A = require("fp-ts/lib/Array")

const createArticlePages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions
  const postTemplate = path.resolve(
    `src/templates/ArticleTemplate/ArticleTemplate.tsx`
  )

  const result = await graphql(`
    {
      allFile(
        sort: {
          order: DESC
          fields: [childMarkdownRemark___frontmatter___date]
        }
        filter: { relativeDirectory: { eq: "articles" } }
        limit: 1000
      ) {
        edges {
          node {
            childMarkdownRemark {
              frontmatter {
                path
              }
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

  result.data.allFile.edges.forEach(({ node }) => {

    const context = {
      filePath: node.childMarkdownRemark.frontmatter.path,
    }

    reporter.info(
      `article page [${node.name}] context: ${JSON.stringify(
        context,
        null,
        4
      )}`
    )

    createPage({
      path: `/articles/${node.childMarkdownRemark.frontmatter.path}`,
      component: postTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createActorTimelinePages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions
  const postTemplate = path.resolve(
    `src/templates/ActorTimelineTemplate/ActorTimelineTemplate.tsx`
  )

  const result = await graphql(`
    {
      actors: allDirectory(
        filter: { relativeDirectory: { eq: "events/actors" } }
      ) {
        nodes {
          name
        }
      }
    }
  `)

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running createTimelinePages query.`)
    return
  }

  const nodes = result.data.actors.nodes

  nodes.forEach(node => {
    const nodePath = `/timelines/${node.name}`
    const relativeDirectory = `events/actors/${node.name}`
    const imagesRelativeDirectoryGlob = `${relativeDirectory}/images/**`

    const context = {
      subject: node.name,
      relativeDirectory,
      imagesRelativeDirectoryGlob,
    }

    reporter.info(
      `timeline page [${node.name}] context: ${JSON.stringify(
        context,
        null,
        4
      )}`
    )

    createPage({
      path: nodePath,
      component: postTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createNetworkPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions

  const result = await graphql(`
    {
      allDirectory(filter: { relativeDirectory: { glob: "events/networks" } }) {
        nodes {
          name
        }
      }
    }
  `)

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running GraphQL allNetworks query.`)
    return
  }

  const component = path.resolve(
    `src/templates/NetworkTemplate/NetworkTemplate.tsx`
  )

  result.data.allDirectory.nodes.forEach(({ name }) => {
    const relativeDirectory = `events/networks/${name}`
    const eventsRelativeDirectory = `events/networks/${name}/*`
    const imagesRelativeDirectory = `events/networks/${name}/*/images`

    const context = {
      relativeDirectory,
      eventsRelativeDirectory,
      imagesRelativeDirectory,
    }
    reporter.info(
      `network page [${name}] context: ${JSON.stringify(context, null, 4)}`
    )

    createPage({
      path: `/networks/${name}`,
      component,
      // additional data can be passed via context
      context,
    })
  })
}

const createTopicTimelinePages = async ({
  actions,
  graphql,
  reporter,
}) => {
  const { createPage } = actions
  const topicTimelineTemplate = path.resolve(
    `src/templates/TopicTimelineTemplate/TopicTimelineTemplate.tsx`
  )

  const result = await graphql(`
    {
      allDirectory(
        filter: { relativeDirectory: { glob: "events/networks/*" } }
      ) {
        nodes {
          relativeDirectory
          name
        }
      }
    }
  `)

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(
      `Error while running createNetworkTopicTimelinePages query.`
    )
    return
  }

  const nodes = result.data.allDirectory.nodes

  nodes.forEach(node => {
    const parentName = A.takeRight(1)(node.relativeDirectory.split("/"))[0]
    const nodePath = `/timelines/${parentName}/${node.name}`
    const relativeDirectory = `events/networks/${parentName}/${node.name}`
    const imagesRelativeDirectoryPath = `${relativeDirectory}/images`

    const context = {
      relativeDirectory,
      imagesRelativeDirectoryPath,
    }

    reporter.info(
      `NetworkTopicTimeline [${node.name}] context: ${JSON.stringify(
        context,
        null,
        4
      )}`
    )

    console.log(nodePath)
    createPage({
      path: nodePath,
      component: topicTimelineTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

exports.createPages = async ({ actions, graphql, reporter }) => {
  await createArticlePages({ actions, graphql, reporter })
  await createActorTimelinePages({ actions, graphql, reporter })
  await createTopicTimelinePages({ actions, graphql, reporter })
  await createNetworkPages({ actions, graphql, reporter })
}

exports.onCreateWebpackConfig = ({ actions }) => {
  actions.setWebpackConfig({
    resolve: {
      alias: {
        "@components": path.resolve(__dirname, "src/components"),
        "@helpers": path.resolve(__dirname, "src/helpers"),
        "@models": path.resolve(__dirname, "src/models"),
        "@theme": path.resolve(__dirname, 'src/theme'),
        "@utils": path.resolve(__dirname, "src/utils"),
      },
    },
  })
}
