import { ErrorBox } from "@components/Common/ErrorBox";
import { MainContent } from "@components/MainContent";
import { PageContent } from "@components/PageContent";
import SEO from "@components/SEO";
import SearchableInput from "@components/SearchableInput";
import { ActorListItem } from "@components/lists/ActorList";
import { actorsList, pageContentByPath } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import { Spinner } from "baseui/icon";
import React from "react";

export default class ActorsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{ actorsList, pageContent: pageContentByPath }}
        params={{
          actorsList: {
            pagination: { page: 1, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
          pageContent: {
            path: "actors",
          },
        }}
        render={QR.fold(
          () => (
            <Spinner />
          ),
          ErrorBox,
          ({ actorsList: acts, pageContent }) => (
            <>
              <SEO title={pageContent.title} />
              <MainContent>
                <PageContent {...pageContent} />
                <SearchableInput
                  items={acts.map((a) => ({
                    ...a,
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
    );
  }
}
