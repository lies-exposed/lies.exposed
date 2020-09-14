import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import SearchableInput from "@components/SearchableInput"
import { TopicListItem } from "@components/lists/TopicList"
import { PageContentFileNode } from "@models/page"
import { TopicFrontmatter } from "@models/topic"
import theme from "@theme/CustomeTheme"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { graphql, PageProps, useStaticQuery } from "gatsby"
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
      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
          <MainContent>
            <PageContent {...pageContent.childMarkdownRemark} />
            <SearchableInput
              items={topics.map((t) => ({
                ...t,
                selected: false,
              }))}
              selectedItems={[]}
              getValue={(t) => t.label}
              itemRenderer={(item, props, index) => (
                <TopicListItem item={item} index={index} $theme={theme} />
              )}
              onSelectItem={async (item) => {
                await navigate(`/topics/${item.uuid}`)
              }}
              onUnselectItem={() => {}}
            />
          </MainContent>
        </Layout>
      )
    })
  )
}

export default TopicsPage
