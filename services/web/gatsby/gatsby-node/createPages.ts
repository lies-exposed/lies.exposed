import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import * as TE from "fp-ts/lib/TaskEither"
import { CreatePagesArgs } from "gatsby"
import * as path from "path"
import { actorsList, pagesList, topicsList } from "../../src/providers/DataProvider"

// const createArticlePages = async ({
//   actions,
//   graphql,
//   reporter,
// }: CreatePagesArgs): Promise<void> => {
//   const { createPage } = actions
//   const BlogPostTemplate = path.resolve(`src/templates/ArticleTemplate.tsx`)

//   const result = await graphql<{
//     articles: { nodes: ArticleFrontmatter[] }
//   }>(`
//     {
//       articles: allArticleFrontmatter {
//         nodes {
//           uuid
//           title
//           path
//         }
//       }
//     }
//   `)

//   // Handle errors
//   if (result.errors !== undefined) {
//     reporter.panicOnBuild(`Error while running GraphQL query.`)
//     return
//   }

//   if (result.data === undefined) {
//     reporter.panicOnBuild(`No data for article pages`)
//     return
//   }

//   result.data.articles.nodes.forEach((node) => {
//     const context = {
//       articleUUID: node.uuid,
//     }

//     reporter.info(
//       `article page [${node.title}] context: ${JSON.stringify(
//         context,
//         null,
//         4
//       )}`
//     )

//     createPage({
//       path: `/blog/${node.path}`,
//       component: BlogPostTemplate,
//       // additional data can be passed via context
//       context,
//     })
//   })
// }

// const createGroupPages = async ({
//   actions,
//   graphql,
//   reporter,
// }: CreatePagesArgs): Promise<void> => {
//   const { createPage } = actions
//   const groupTemplate = path.resolve(`src/templates/GroupTemplate.tsx`)

//   const result = await graphql<{
//     groups: {
//       nodes: Array<{
//         uuid: string
//         name: string
//         members: Array<{ uuid: string }>
//       }>
//     }
//   }>(`
//     {
//       groups: allGroupFrontmatter {
//         nodes {
//           uuid
//           name
//           members {
//             uuid
//           }
//         }
//       }
//     }
//   `)

//   // Handle errors
//   if (result.errors !== undefined) {
//     reporter.panicOnBuild(
//       `Error while running createTimelinePages query.`,
//       result.errors
//     )
//     return
//   }

//   if (result.data === undefined) {
//     reporter.panicOnBuild(`No data for group pages`)
//     return
//   }

//   const nodes = result.data.groups.nodes

//   nodes.forEach((node) => {
//     const groupUUID = node.uuid
//     const nodePath = `/groups/${groupUUID}`

//     const context = {
//       group: groupUUID,
//       members: (node.members ?? []).map((m) => m.uuid),
//     }

//     reporter.info(
//       `Group template [${groupUUID}], context: ${JSON.stringify(
//         context,
//         null,
//         4
//       )}`
//     )

//     createPage({
//       path: nodePath,
//       component: groupTemplate,
//       // additional data can be passed via context
//       context,
//     })
//   })
// }

// const createActorPages = async ({
//   actions,
//   graphql,
//   reporter,
// }: CreatePagesArgs): Promise<void> => {
//   const { createPage } = actions
//   const actorTemplate = path.resolve(`src/templates/ActorTemplate.tsx`)

//   const result = await graphql<{ actors: { nodes: Array<{ uuid: string }> } }>(`
//     {
//       actors: allActorFrontmatter {
//         nodes {
//           uuid
//         }
//       }
//     }
//   `)

//   // Handle errors
//   if (result.errors !== undefined) {
//     reporter.panicOnBuild(`Error while running createActorPages query.`)
//     return
//   }

//   if (result.data === undefined) {
//     reporter.panicOnBuild(`No data for actor pages`)
//     return
//   }

//   const nodes = result.data.actors.nodes
//   nodes.forEach((node) => {
//     const actorUUID = node.uuid
//     const nodePath = `/actors/${actorUUID}`

//     const context = {
//       actorUUID,
//     }

//     reporter.info(
//       `Actor page [${nodePath}] context: ${JSON.stringify(context, null, 4)}`
//     )

//     createPage({
//       path: nodePath,
//       component: actorTemplate,
//       // additional data can be passed via context
//       context,
//     })
//   })
// }

// const createEventPages = async ({
//   actions,
//   graphql,
//   reporter,
// }: CreatePagesArgs): Promise<void> => {
//   const { createPage } = actions
//   const postTemplate = path.resolve(`src/templates/EventTemplate.tsx`)

//   const result = await graphql<{ events: { nodes: Array<{ uuid: string }> } }>(`
//     {
//       events: allEventFrontmatter {
//         nodes {
//           uuid
//         }
//       }
//     }
//   `)

//   // Handle errors
//   if (result.errors !== undefined) {
//     reporter.panicOnBuild(
//       `Error while running createEventPages query.`,
//       result.errors
//     )
//     return
//   }

//   if (result.data === undefined) {
//     reporter.panicOnBuild(`No data for actor pages`)
//     return
//   }

//   const nodes = result.data.events.nodes
//   nodes.forEach((node) => {
//     const eventUUID = node.uuid
//     const nodePath = `/events/${eventUUID}`

//     const context = {
//       eventUUID,
//     }

//     reporter.info(
//       `Event page [${nodePath}] context: ${JSON.stringify(context, null, 4)}`
//     )

//     createPage({
//       path: nodePath,
//       component: postTemplate,
//       // additional data can be passed via context
//       context,
//     })
//   })
// }

// const createTopicPages = async ({
//   actions,
//   graphql,
//   reporter,
// }: CreatePagesArgs): Promise<void> => {
//   const { createPage } = actions
//   const topicTemplate = path.resolve(`src/templates/TopicTemplate.tsx`)

//   const result = await graphql<{ topics: { nodes: Array<{ uuid: string }> } }>(`
//     {
//       topics: allTopicFrontmatter {
//         nodes {
//           uuid
//         }
//       }
//     }
//   `)

//   // Handle errors
//   if (result.errors !== undefined) {
//     // eslint-disable-next-line
//     console.error({ errors: result.errors })
//     reporter.panicOnBuild(`Error while running createTopicPages query.`)
//     return
//   }

//   if (result.data === undefined) {
//     reporter.panicOnBuild(`No data for topics pages`)
//     return
//   }

//   const nodes = result.data.topics.nodes

//   nodes.forEach((node) => {
//     const nodePath = `/topics/${node.uuid}`

//     const context = {
//       topic: node.uuid,
//     }

//     reporter.info(
//       `Topic [${node.uuid}] context: ${JSON.stringify(context, null, 4)}`
//     )
//     reporter.info(`Building to path: ${nodePath}`)

//     createPage({
//       path: nodePath,
//       component: topicTemplate,
//       // additional data can be passed via context
//       context,
//     })
//   })
// }

// const createAreasPages = async ({
//   actions,
//   graphql,
//   reporter,
// }: CreatePagesArgs): Promise<void> => {
//   const { createPage } = actions
//   const areaTemplate = path.resolve(`src/templates/AreaTemplate.tsx`)

//   const result = await graphql<{
//     areas: {
//       nodes: Array<{
//         uuid: string
//         groups: Array<{ uuid: string }>
//         topics: Array<{ uuid: string }>
//       }>
//     }
//   }>(`
//     {
//       areas: allAreaFrontmatter {
//         nodes {
//           uuid
//           groups {
//             uuid
//           }
//           topics {
//             uuid
//           }
//         }
//       }
//     }
//   `)

//   // Handle errors
//   if (result.errors !== undefined) {
//     reporter.panicOnBuild(
//       `Error while running createAreaPages query.`,
//       result.errors
//     )
//     return
//   }

//   if (result.data === undefined) {
//     reporter.panicOnBuild(`No data for topics pages`)
//     return
//   }

//   const nodes = result.data.areas.nodes

//   nodes.forEach((node) => {
//     const nodePath = `/areas/${node.uuid}`

//     const context = {
//       areaUUID: node.uuid,
//       groupUUIDs: (node.groups ?? []).map((g) => g.uuid),
//       topicUUIDs: (node.topics ?? []).map((t) => t.uuid),
//     }

//     reporter.info(`Area context: ${JSON.stringify(context, null, 4)}`)
//     reporter.info(`Building to path: ${nodePath}`)

//     createPage({
//       path: nodePath,
//       component: areaTemplate,
//       // additional data can be passed via context
//       context,
//     })
//   })
// }

// /**
//  * Projects
//  *
//  * */
// const createProjectPages = async ({
//   actions,
//   graphql,
//   reporter,
// }: CreatePagesArgs): Promise<void> => {
//   const { createPage } = actions
//   const projectTemplate = path.resolve(`src/templates/ProjectTemplate.tsx`)

//   const result = await graphql<{
//     projects: {
//       nodes: ProjectFrontmatter[]
//     }
//   }>(`
//     {
//       projects: allProjectFrontmatter {
//         nodes {
//           uuid
//           name
//         }
//       }
//     }
//   `)

//   // Handle errors
//   if (result.errors !== undefined) {
//     reporter.panicOnBuild(`Error while running createTopicPages query.`)
//     return
//   }

//   if (result.data === undefined) {
//     reporter.panicOnBuild(`No data for topics pages`)
//     return
//   }

//   const nodes = result.data.projects.nodes

//   nodes.forEach((node) => {
//     const nodePath = `/projects/${node.uuid}`

//     const context = {
//       projectUUID: node.uuid,
//     }
//     reporter.info(`Project context: ${JSON.stringify(context, null, 4)}`)
//     reporter.info(`Building to path: ${nodePath}`)

//     createPage({
//       path: nodePath,
//       component: projectTemplate,
//       // additional data can be passed via context
//       context,
//     })
//   })
// }

/**
 * Pages
 *
 * */
const createPagesTask = ({ actions, reporter }: CreatePagesArgs) => async (
  q: TE.TaskEither<any, any[]>,
  templatePath: string
): Promise<void> => {
  const { createPage } = actions

  // Handle errors
  return pipe(
    q,
    TE.chain((pages) => {
      return TE.tryCatch(
        () =>
          new Promise((resolve, reject) => {
            try {
              pages.forEach((p) => {
                const nodePath = `${p.frontmatter.path}`
                reporter.info(`Building to path: ${nodePath}`)

                const context = p

                createPage({
                  path: nodePath,
                  component: templatePath,
                  // additional data can be passed via context
                  context,
                })
              })
              return resolve(undefined)
            } catch (e) {
              return reject(e)
            }
          }),
        E.toError
      )
    }),
    TE.fold(
      (e) => {
        reporter.error(`An error occured ${JSON.stringify(e)}`)
        return () => Promise.reject(e)
      },
      () => {
        return () => Promise.resolve()
      }
    )
  )()
}

export const createPages = async (args: CreatePagesArgs) => {
  const makePages = createPagesTask(args)

  await makePages(
    pagesList.run({
      pagination: { perPage: 20, page: 1 },
      sort: { field: "createdAt", order: "ASC" },
      filter: {},
    }),
    path.resolve(`src/templates/PageTemplate.tsx`)
  )

  // actors
  await makePages(
    actorsList.run({
      pagination: { perPage: 20, page: 1 },
      sort: { field: "createdAt", order: "ASC" },
      filter: {},
    }),
    path.resolve(`src/templates/ActorTemplate.tsx`)
  )

  // topics
  await makePages(
    topicsList.run({
      pagination: { perPage: 20, page: 1 },
      sort: { field: "createdAt", order: "ASC" },
      filter: {},
    }),
    path.resolve(`src/templates/ActorTemplate.tsx`)
  )
}
