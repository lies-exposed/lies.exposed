import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import TopicList from "@components/lists/TopicList"
import { PageContentFileNode } from "@models/page"
import { TopicFrontmatter } from "@models/topic"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { useStaticQuery, graphql, PageProps } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface Results {
  topics: { nodes: unknown[] }
  pageContent: PageContentFileNode
}

const TopicsPage: React.FC<PageProps> = ({ navigate }) => {
  const results = useStaticQuery<Results>(graphql`
    query TopicsPage {
      pageContent: file(
        childMarkdownRemark: { fields: { collection: { eq: "pages" } } }
        name: { eq: "topics" }
      ) {
        ...PageFileNode
      }

      topics: allTopicFrontmatter {
        nodes {
          ...Topic
        }
      }
    }
  `)

  return pipe(
    sequenceS(E.either)({
      topics: t.array(TopicFrontmatter).decode(results.topics.nodes),
      pageContent: PageContentFileNode.decode(results.pageContent),
    }),
    E.fold(throwValidationErrors, ({ pageContent, topics }) => {
      const topicItems = {
        itemId: "#topics-items",
        title: "Topics",
        subNav: topics.map((t) => {
          return {
            itemId: `/topics/${t.uuid}`,
            title: t.label,
            subNav: [],
          }
        }),
      }

      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
          <ContentWithSideNavigation items={[topicItems]}>
            <PageContent {...pageContent.childMarkdownRemark} />
            <TopicList
              topics={topics.map((t) => ({
                ...t,
                selected: false,
              }))}
              onTopicClick={async (t) => await navigate(`/topics/${t.uuid}`)}
            />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )
}

export default TopicsPage
