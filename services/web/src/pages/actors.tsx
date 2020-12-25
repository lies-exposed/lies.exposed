import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import SearchableInput from "@components/SearchableInput"
import { ActorListItem } from "@components/lists/ActorList"
import { actorsList, pageContent } from "@providers/DataProvider"
import { RouteComponentProps } from "@reach/router"
import * as QR from "avenger/lib/QueryResult"
import { WithQueries } from "avenger/lib/react"
import { Spinner } from "baseui/icon"
import React from "react"

export default class ActorsPage extends React.PureComponent<
  RouteComponentProps
> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ actorsList, pageContent: pageContent }}
        params={{
          actorsList: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
          pageContent: {
            id: "actors",
          },
        }}
        render={QR.fold(
          () => (
            <Spinner />
          ),
          () => (
            <p>there was a problem when fetching preferences</p>
          ),
          ({ actorsList: acts, pageContent }) => (
            <>
              <SEO title={pageContent.frontmatter.title} />
              <MainContent>
                <PageContent {...pageContent} />
                <SearchableInput
                  items={acts.map((a) => ({
                    ...a.frontmatter,
                    id: a.id,
                    selected: false,
                  }))}
                  selectedItems={[]}
                  getValue={(a) => a.fullName}
                  onSelectItem={async (a) => {
                    // await navigateTo(navigate, "actors", a)
                  }}
                  onUnselectItem={() => {}}
                  itemRenderer={(item, _, index) => (
                    <ActorListItem
                      index={index}
                      item={item}
                      avatarScale="scale1600"
                      onClick={async (item) => {
                        // await navigateTo(navigate, "actors", item)
                      }}
                    />
                  )}
                />
              </MainContent>
            </>
          )
        )}
      />
    )
  }
}
