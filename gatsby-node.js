const path = require("path")
const A = require("fp-ts/lib/Array")

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

const createNetworkTopicTimelinePages = async ({
  actions,
  graphql,
  reporter,
}) => {
  const { createPage } = actions
  const networkTopicTimelineTemplate = path.resolve(
    `src/templates/NetworkTopicTimelineTemplate/NetworkTopicTimelineTemplate.tsx`
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
      component: networkTopicTimelineTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

exports.createPages = async ({ actions, graphql, reporter }) => {
  await createArticlePages({ actions, graphql, reporter })
  await createActorTimelinePages({ actions, graphql, reporter })
  await createNetworkPages({ actions, graphql, reporter })
  await createNetworkTopicTimelinePages({ actions, graphql, reporter })
}
