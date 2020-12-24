import { Layout } from "@components/Layout"
import { TopicListItem } from "@components/lists/TopicList"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SearchableInput from "@components/SearchableInput"
import SEO from "@components/SEO"
import { PageMD } from "@models/page"
import { TopicFrontmatter } from "@models/topic"
import theme from "@theme/CustomeTheme"
import { navigateTo } from "@utils/links"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { PageProps } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface Results {
  topics: { nodes: unknown[] }
  pageContent: { childMdx: unknown }
}

const TopicsPage: React.FC<PageProps> = ({ navigate }) => {
  // const results = useStaticQuery<Results>(graphql`
  //   query TopicsPage {
  //     pageContent: file(
  //       childMdx: { fields: { collection: { eq: "pages" } } }
  //       name: { eq: "topics" }
  //     ) {
  //       childMdx {
  //         ...PageMD
  //       }
  //     }

  //     topics: allTopicFrontmatter {
  //       nodes {
  //         ...Topic
  //       }
  //     }
  //   }
  // `)

  const results = {
    pageContent: { childMdx: undefined },
    topics: { nodes: [] },
  }
  return pipe(
    sequenceS(E.either)({
      topics: t.array(TopicFrontmatter).decode(results.topics.nodes),
      pageContent: PageMD.decode(results.pageContent.childMdx),
    }),
    E.fold(throwValidationErrors, ({ pageContent, topics }) => {
      return (
        <Layout>
          <SEO title={pageContent.frontmatter.title} />
          <MainContent>
            <PageContent {...pageContent} />
            <SearchableInput
              items={topics.map((t) => ({
                ...t,
                selected: false,
              }))}
              selectedItems={[]}
              getValue={(t) => t.label}
              itemRenderer={(item, props, index) => (
                <TopicListItem
                  item={item}
                  index={index}
                  $theme={theme}
                  onClick={async (t) => await navigateTo(navigate, "topics", t)}
                />
              )}
              onSelectItem={async (item) => {
                await navigateTo(navigate, "topics", item)
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
