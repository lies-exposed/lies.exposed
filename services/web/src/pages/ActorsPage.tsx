import { ActorList } from "@components/lists/ActorList";
import { ErrorBox } from "@econnessione/shared/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/shared/components/Common/FullSizeLoader";
import { MainContent } from "@econnessione/shared/components/MainContent";
import { PageContent } from "@econnessione/shared/components/PageContent";
import SEO from "@econnessione/shared/components/SEO";
import SearchableInput from "@econnessione/shared/components/SearchableInput";
import {
  actorsList,
  pageContentByPath,
} from "@econnessione/shared/providers/DataProvider";
import { navigateTo } from "@econnessione/shared/utils/links";
import { navigate, RouteComponentProps } from "@reach/router";
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
            pagination: { page: 0, perPage: 20 },
            sort: { field: "id", order: "ASC" },
            filter: {},
          },
          pageContent: {
            path: "actors",
          },
        }}
        render={QR.fold(
          LazyFullSizeLoader,
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
                  itemRenderer={(item, _, index) => <span />}
                />
                <ActorList
                  actors={acts.map((a) => ({
                    ...a,
                    selected: false,
                  }))}
                  onActorClick={async (a) => {
                    await navigate(`/actors/${a.id}`);
                  }}
                />
              </MainContent>
            </>
          )
        )}
      />
    );
  }
}
