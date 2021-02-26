import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { Loader } from "@econnessione/shared/components/Common/Loader";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SEO from "@econnessione/shared/components/SEO";
import SearchableInput from "@econnessione/shared/components/SearchableInput";
import { ActorListItem } from "@econnessione/shared/components/lists/ActorList";
import { navigateTo } from "@econnessione/shared/utils/links";
import { actorsList, pageContentByPath } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
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
          Loader,
          ErrorBox,
          ({ actorsList: { data: acts }, pageContent }) => (
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
                  getValue={(a) => a.id}
                  onSelectItem={async (a) => {
                    if (this.props.navigate) {
                      await navigateTo(this.props.navigate, `actors`, a);
                    }
                  }}
                  onUnselectItem={() => {}}
                  itemRenderer={(item, _, index) => (
                    <ActorListItem
                      index={index}
                      item={item}
                      avatarScale="scale1600"
                      onClick={async (item: any) => {
                        if (this.props.navigate) {
                          await navigateTo(this.props.navigate, `actors`, item);
                        }
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
