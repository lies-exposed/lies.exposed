import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import SearchableInput from "@components/SearchableInput"
import { ActorListItem } from "@components/lists/ActorList"
import { ActorFrontmatter } from "@models/actor"
import { PageContentFileNode } from "@models/page"
import { navigateTo } from "@utils/links"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { useStaticQuery, graphql, PageProps } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface Results {
  actors: { nodes: unknown[] }
  pageContent: PageContentFileNode
}

const ActorsPage: React.FC<PageProps> = ({ navigate }) => {
  const results: Results = useStaticQuery(graphql`
    query ActorsPage {
      pageContent: file(
        childMdx: { fields: { collection: { eq: "pages" } } }
        name: { eq: "actors" }
      ) {
        ...PageFileNode
      }

      actors: allActorFrontmatter {
        nodes {
          ...Actor
        }
      }
    }
  `)

  return pipe(
    sequenceS(E.either)({
      actors: t.array(ActorFrontmatter).decode(results.actors.nodes),
      pageContent: PageContentFileNode.decode(results.pageContent),
    }),
    E.fold(throwValidationErrors, ({ actors, pageContent }) => {
      const acts = actors.map((a) => ({
        ...a,
        selected: false,
      }))

      return (
        <Layout>
          <SEO title={pageContent.childMdx.frontmatter.title} />
          <MainContent>
            <PageContent {...pageContent.childMdx} />
            <SearchableInput
              items={acts}
              selectedItems={[]}
              getValue={(a) => a.fullName}
              onSelectItem={async (a) => {
                await navigateTo(navigate, "actors", a)
              }}
              onUnselectItem={() => {}}
              itemRenderer={(item, _, index) => (
                <ActorListItem
                  index={index}
                  item={item}
                  avatarScale="scale1600"
                  onClick={async (item) => {
                    await navigateTo(navigate, "actors", item)
                  }}
                />
              )}
            />
          </MainContent>
        </Layout>
      )
    })
  )
}

export default ActorsPage
