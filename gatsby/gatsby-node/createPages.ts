import * as path from "path"
import { ProjectFrontmatter } from "@models/Project"
import { AreaFrontmatter } from "@models/area"
import { ArticleFrontmatter } from "@models/article"
import { GroupMD } from "@models/group"
import { CreatePagesArgs } from "gatsby"

const createArticlePages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const BlogPostTemplate = path.resolve(`src/templates/ArticleTemplate.tsx`)

  const result = await graphql<{
    articles: { nodes: ArticleFrontmatter[] }
  }>(`
    {
      articles: allArticleFrontmatter {
        nodes {
          uuid
          title
          path
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running GraphQL query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for article pages`)
    return
  }

  result.data.articles.nodes.forEach((node) => {
    const context = {
      articleUUID: node.uuid,
    }

    reporter.info(
      `article page [${node.title}] context: ${JSON.stringify(
        context,
        null,
        4
      )}`
    )

    createPage({
      path: `/blog/${node.path}`,
      component: BlogPostTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createGroupPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const groupTemplate = path.resolve(`src/templates/GroupTemplate.tsx`)

  const result = await graphql<{
    groups: { nodes: Array<{ childMdx: GroupMD }> }
  }>(`
    {
      groups: allFile(filter: { sourceInstanceName: { eq: "groups" } }) {
        nodes {
          childMdx {
            frontmatter {
              ... on GroupFrontmatter {
                uuid
                name
                members {
                  uuid
                }
              }
            }
          }
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(
      `Error while running createTimelinePages query.`,
      result.errors
    )
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for group pages`)
    return
  }

  const nodes = result.data.groups.nodes

  
  nodes.forEach((node) => {
    const groupUUID = node.childMdx.frontmatter.uuid
    const nodePath = `/groups/${groupUUID}`

    const context = {
      group: groupUUID,
      members: ((node.childMdx.frontmatter.members as any) ?? []).map(
        (m: any) => m.uuid
      ),
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

const createActorPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const actorTemplate = path.resolve(`src/templates/ActorTemplate.tsx`)

  const result = await graphql<{ actors: { nodes: Array<{ name: string }> } }>(`
    {
      actors: allFile(filter: { sourceInstanceName: { eq: "actors" } }) {
        nodes {
          name
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running createActorPages query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for actor pages`)
    return
  }

  const nodes = result.data.actors.nodes
  nodes.forEach((node) => {
    const actorUUID = node.name
    const nodePath = `/actors/${actorUUID}`

    const context = {
      actorUUID,
    }

    reporter.info(
      `Actor page [${nodePath}] context: ${JSON.stringify(context, null, 4)}`
    )

    createPage({
      path: nodePath,
      component: actorTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createEventPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const postTemplate = path.resolve(`src/templates/EventTemplate.tsx`)

  const result = await graphql<{ events: { nodes: Array<{ name: string }> } }>(`
    {
      events: allFile(filter: { sourceInstanceName: { eq: "events" } }) {
        nodes {
          name
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running createEventPages query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for actor pages`)
    return
  }

  const nodes = result.data.events.nodes
  nodes.forEach((node) => {
    const eventUUID = node.name
    const nodePath = `/events/${eventUUID}`

    const context = {
      eventUUID,
    }

    reporter.info(
      `Event page [${nodePath}] context: ${JSON.stringify(context, null, 4)}`
    )

    createPage({
      path: nodePath,
      component: postTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createTopicPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const topicTemplate = path.resolve(`src/templates/TopicTemplate.tsx`)

  const result = await graphql<{ topics: { nodes: Array<{ name: string }> } }>(`
    {
      topics: allFile(filter: { sourceInstanceName: { eq: "topics" } }) {
        nodes {
          name
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running createTopicPages query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for topics pages`)
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
      component: topicTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

const createAreasPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const areaTemplate = path.resolve(`src/templates/AreaTemplate.tsx`)

  const result = await graphql<{
    areas: {
      nodes: Array<{
        name: string
        childMdx: { frontmatter: AreaFrontmatter }
      }>
    }
  }>(`
    {
      areas: allFile(filter: { sourceInstanceName: { eq: "areas" } }) {
        nodes {
          name
          childMdx {
            frontmatter {
              ... on AreaFrontmatter {
                groups {
                  uuid
                }
                topics {
                  uuid
                }
              }
            }
          }
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running createTopicPages query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for topics pages`)
    return
  }

  const nodes = result.data.areas.nodes

  nodes.forEach((node) => {
    const nodePath = `/areas/${node.name}`

    const context = {
      areaUUID: node.name,
      groupUUIDs: node.childMdx.frontmatter.groups.map((g) => g.uuid),
      topicUUIDs: node.childMdx.frontmatter.topics.map((t) => t.uuid),
    }

    reporter.info(`Area context: ${JSON.stringify(context, null, 4)}`)
    reporter.info(`Building to path: ${nodePath}`)

    createPage({
      path: nodePath,
      component: areaTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

/**
 * Projects
 *
 * */
const createProjectPages = async ({
  actions,
  graphql,
  reporter,
}: CreatePagesArgs): Promise<void> => {
  const { createPage } = actions
  const projectTemplate = path.resolve(`src/templates/ProjectTemplate.tsx`)

  const result = await graphql<{
    projects: {
      nodes: Array<{
        name: string
        childMdx: { frontmatter: ProjectFrontmatter }
      }>
    }
  }>(`
    {
      projects: allFile(filter: { sourceInstanceName: { eq: "projects" } }) {
        nodes {
          name
          childMdx {
            frontmatter {
              ... on ProjectFrontmatter {
                uuid
                name
              }
            }
          }
        }
      }
    }
  `)

  // Handle errors
  if (result.errors !== undefined) {
    reporter.panicOnBuild(`Error while running createTopicPages query.`)
    return
  }

  if (result.data === undefined) {
    reporter.panicOnBuild(`No data for topics pages`)
    return
  }

  const nodes = result.data.projects.nodes

  nodes.forEach((node) => {
    const nodePath = `/projects/${node.name}`

    const context = {
      projectUUID: node.name,
    }
    reporter.info(`Project context: ${JSON.stringify(context, null, 4)}`)
    reporter.info(`Building to path: ${nodePath}`)

    createPage({
      path: nodePath,
      component: projectTemplate,
      // additional data can be passed via context
      context,
    })
  })
}

export const createPages = async (options: CreatePagesArgs): Promise<void> => {
  await createArticlePages(options)
  await createActorPages(options)
  await createGroupPages(options)
  await createTopicPages(options)
  await createEventPages(options)
  await createAreasPages(options)
  await createProjectPages(options)
}
