import { Actor } from "@econnessione/shared/io/http/Actor";
import {
  Queries,
  pageContentByPath,
} from "@econnessione/shared/providers/DataProvider";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import SEO from "@econnessione/ui/components/SEO";
import SearchableInput from "@econnessione/ui/components/SearchableInput";
import { ActorList } from "@econnessione/ui/components/lists/ActorList";
import { navigateTo } from "@econnessione/ui/utils/links.utils";
import { navigate, RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";

export default class ActorsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <WithQueries
        queries={{
          actors: Queries.Actor.getList,
          pageContent: pageContentByPath,
        }}
        params={{
          actors: {
            pagination: { page: 1, perPage: 20 },
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
          ({ actors: { data: acts }, pageContent }) => (
            <>
              <SEO title={pageContent.title} />
              <MainContent>
                <PageContent {...pageContent} />
                <SearchableInput<Actor>
                  label="Attori"
                  items={acts.map((a) => ({
                    ...a,
                    selected: false,
                  }))}
                  getValue={(a) => a.fullName}
                  selectedItems={[]}
                  onSelectItem={async (a) => {
                    if (this.props.navigate) {
                      await navigateTo(this.props.navigate, `actors`, a);
                    }
                  }}
                  onUnselectItem={() => {}}
                  renderOption={() => <span />}
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
