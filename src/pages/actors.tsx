import { ContentWithSideNavigation } from "@components/ContentWithSideNavigation"
import { Layout } from "@components/Layout"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import ActorList from "@components/lists/ActorList"
import { ActorPageContentFileNode } from "@models/actor"
import { PageContentFileNode } from "@models/page"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { sequenceS } from "fp-ts/lib/Apply"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import { useStaticQuery, graphql, PageProps } from "gatsby"
import * as t from "io-ts"
import React from "react"

interface Results {
  actors: { nodes: ActorPageContentFileNode[] }
  pageContent: PageContentFileNode
}

const ActorsPage: React.FC<PageProps> = ({ navigate }) => {
  const results: Results = useStaticQuery(graphql`
    query ActorsPage {
      actors: allFile(
        filter: {
          sourceInstanceName: { eq: "content" }
          relativeDirectory: { eq: "actors" }
        }
      ) {
        nodes {
          ...ActorPageContentFileNode
        }
      }

      pageContent: file(relativePath: { eq: "pages/actors.md" }) {
        ...PageContentFileNode
      }
    }
  `)

  return pipe(
    sequenceS(E.either)({
      actors: t.array(ActorPageContentFileNode).decode(results.actors.nodes),
      pageContent: PageContentFileNode.decode(results.pageContent),
    }),
    E.fold(throwValidationErrors, ({ actors, pageContent }) => {
      const actorItems = {
        itemId: "#actors-items",
        title: "Attori",
        subNav: actors.map((n) => ({
          itemId: `/actors/${n.childMarkdownRemark.frontmatter.username}`,
          title: n.childMarkdownRemark.frontmatter.fullName,
          subNav: [],
        })),
      }

      const acts = actors.map((a) => ({
        ...a.childMarkdownRemark.frontmatter,
        selected: false,
      }))

      return (
        <Layout>
          <SEO title={pageContent.childMarkdownRemark.frontmatter.title} />
          <ContentWithSideNavigation items={[actorItems]}>
            <PageContent {...pageContent.childMarkdownRemark} />
            <ActorList
              actors={acts}
              onActorClick={async (a) => {
                await navigate(`/actors/${a.uuid}`)
              }}
              avatarScale='scale1600'
            />
          </ContentWithSideNavigation>
        </Layout>
      )
    })
  )
}

export default ActorsPage
