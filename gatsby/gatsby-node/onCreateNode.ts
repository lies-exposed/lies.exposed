import { CreateNodeArgs } from "gatsby"
import { MD_TYPE } from "./consts"

type Collection =
  | "actors"
  | "articles"
  | "groups"
  | "uncategorized-events"
  | "pages"
  | "topics"
  | "areas"
  | 'projects'

const collectionToTypeMap: Record<Collection, string> = {
  actors: "ActorFrontmatter",
  articles: "ArticleFrontmatter",
  groups: "GroupFrontmatter",
  'uncategorized-events': "UncategorizedEventFrontmatter",
  pages: "PageFrontmatter",
  topics: "TopicFrontmatter",
  areas: "AreaFrontmatter",
  projects: 'ProjectFrontmatter'
}

export const onCreateNode = ({
  node,
  actions,
  getNode,
  createNodeId,
}: CreateNodeArgs): void => {
  const { createNodeField, createNode } = actions

  if (node.internal.type === MD_TYPE && node.parent !== null) {
    const collection = getNode(node.parent).sourceInstanceName as Collection

    const frontmatter = node.frontmatter as any
    createNodeField({
      name: `collection`,
      node,
      value: collection,
    })

    switch (collection) {
      case "uncategorized-events": {
        createNodeField({
          name: "actors",
          node,
          value: frontmatter.actors ?? [],
        })

        createNodeField({
          name: "groups",
          node,
          value: frontmatter.groups ?? [],
        })

        createNodeField({
          name: "topics",
          node,
          value: frontmatter.topics ?? [],
        })
        break
      }

      case "groups": {
        createNodeField({
          name: "members",
          node,
          value: frontmatter.members ?? [],
        })
        break
      }

      case "areas": {
        createNodeField({
          name: "topics",
          node,
          value: frontmatter.topics ?? [],
        })
        break
      }
    }

    const type = collectionToTypeMap[collection]
    const nodeId = createNodeId(`${type}-${node.id}`)

    createNode({
      ...frontmatter,
      id: nodeId,
      parent: node.id,
      internal: {
        type,
        contentDigest: node.internal.contentDigest,
      },
    })
  }
}