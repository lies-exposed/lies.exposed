import { Layout } from "@components/Layout"
import { ActorListItem } from "@components/lists/ActorList"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SearchableInput from "@components/SearchableInput"
import SEO from "@components/SEO"
import { navigateTo } from "@utils/links"
import * as QR from "avenger/lib/QueryResult"
import { useQueries } from "avenger/lib/react"
import { Spinner } from "baseui/icon"
import { pipe } from "fp-ts/lib/pipeable"
import { PageProps } from "gatsby"
import React from "react"
import { actorsList, onePage } from "../providers/DataProvider"

const ActorsPage: React.FC<PageProps> = ({ navigate }) => {
  return pipe(
    useQueries(
      { actorsList, pageContent: onePage },
      {
        actorsList: {
          pagination: { page: 1, perPage: 20 },
          sort: { field: "id", order: "ASC" },
          filter: {},
        },
        pageContent: {
          id: "actors",
        },
      }
    ),
    QR.fold(
      () => <Spinner />,
      () => <p>there was a problem when fetching preferences</p>,
      ({ actorsList: acts, pageContent }) => (
        <Layout>
          <SEO title={pageContent.frontmatter.title} />
          <MainContent>
            <PageContent {...pageContent} />
            <SearchableInput
              items={acts.map((a) => ({ ...a.frontmatter, selected: false }))}
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
    )
  )
}

export default ActorsPage
