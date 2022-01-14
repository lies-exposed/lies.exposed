import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@econnessione/ui/components/Common/FullSizeLoader";
import { AutocompleteActorInput } from "@econnessione/ui/components/Input/AutocompleteActorInput";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { PageContent } from "@econnessione/ui/components/PageContent";
import { ActorList } from "@econnessione/ui/components/lists/ActorList";
import {
  pageContentByPath,
  Queries,
} from "@econnessione/ui/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { doUpdateCurrentView } from "../utils/location.utils";

export default class ActorsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    return (
      <>
        <MainContent>
          <PageContent queries={{ pageContent: { path: "actors" } }} />
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
                  <AutocompleteActorInput
                    selectedIds={[]}
                    onChange={(c) => {
                      void doUpdateCurrentView({
                        view: "actor",
                        actorId: c[0].id,
                      })();
                    }}
                  />

                  <ActorList
                    actors={acts.map((a) => ({
                      ...a,
                      selected: false,
                    }))}
                    onActorClick={(a) => {
                      void doUpdateCurrentView({
                        view: "actor",
                        actorId: a.id,
                      })();
                    }}
                  />
                </>
              )
            )}
          />
        </MainContent>
      </>
    );
  }
}
