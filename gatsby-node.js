const path = require("path")
const A = require("fp-ts/lib/Array")

const createArticlePages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions
  const postTemplate = path.resolve(
    `src/templates/ArticleTemplate/ArticleTemplate.tsx`
  )

  const result = await graphql(`
    {
      articles: allFile(
        sort: {
          order: DESC
          fields: [childMarkdownRemark___frontmatter___date]
        }
        filter: { relativeDirectory: { eq: "articles" } }
        limit: 1000
      ) {
        nodes {
          childMarkdownRemark {
            frontmatter {
              path
              title
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

  result.data.articles.nodes.forEach((node) => {
    const context = {
      filePath: node.childMarkdownRemark.frontmatter.path,
    }

    reporter.info(
      `article page [${node.childMarkdownRemark.frontmatter.title}] context: ${JSON.stringify(context, null, 4)}`
    )

    createPage({
      path: `/articles/${node.childMarkdownRemark.frontmatter.path}`,
      component: postTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createGroupPages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions
  const groupTemplate = path.resolve(
    `src/templates/GroupTemplate/GroupTemplate.tsx`
  )

  const result = await graphql(`
    {
      groups: allFile(filter: { relativeDirectory: { eq: "groups" } }) {
        nodes {
          childMarkdownRemark {
            frontmatter {
              uuid
              name
              members
            }
          }
        }
      }
    }
  `)

  // Handle errors
  if (result.errors) {
    reporter.panicOnBuild(`Error while running createTimelinePages query.`)
    return
  }

  const nodes = result.data.groups.nodes
  

  nodes.forEach((node) => {
    const groupUUID = node.childMarkdownRemark.frontmatter.uuid
    const nodePath = `/groups/${groupUUID}`

    const context = {
      group: groupUUID,
      members: node.childMarkdownRemark.frontmatter.members
    }

    reporter.info(
      `Group template [${groupUUID}], context: ${JSON.stringify(
        context,
        null,
        4
      )}`
    )

    createPage({
      path: nodePath,
      component: groupTemplate,
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
      actors: allFile(filter: { relativeDirectory: { eq: "actors" } }) {
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

  nodes.forEach((node) => {
    const nodePath = `/actors/${node.name}`

    const context = {
      actor: node.name,
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
      allDirectory(filter: { relativeDirectory: { glob: "networks" } }) {
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

const createTopicTimelinePages = async ({ actions, graphql, reporter }) => {
  const { createPage } = actions
  const topicTimelineTemplate = path.resolve(
    `src/templates/TopicTimelineTemplate/TopicTimelineTemplate.tsx`
  )

  const result = await graphql(`
    {
      topics: allFile(filter: { relativeDirectory: { eq: "topics" } }) {
        nodes {
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

  const nodes = result.data.topics.nodes

  nodes.forEach((node) => {
    const nodePath = `/topics/${node.name}`

    const context = {
      topic: node.name,
    }

    reporter.info(
      `Topic [${node.name}] context: ${JSON.stringify(context, null, 4)}`
    )
    reporter.info(`Building to path: ${nodePath}`)

    createPage({
      path: nodePath,
      component: topicTimelineTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

exports.createPages = async ({ actions, graphql, reporter }) => {
  await createGroupPages({ actions, graphql, reporter })
  await createArticlePages({ actions, graphql, reporter })
  await createActorTimelinePages({ actions, graphql, reporter })
  await createTopicTimelinePages({ actions, graphql, reporter })
  await createNetworkPages({ actions, graphql, reporter })
}

// exports.onCreateNode = ({node}) => {
//   console.log(node)
// }
