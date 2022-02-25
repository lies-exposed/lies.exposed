import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { AutocompleteActorInput } from "@liexp/ui/components/Input/AutocompleteActorInput";
import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import { ActorList } from "@liexp/ui/components/lists/ActorList";
import { pageContentByPath, Queries } from "@liexp/ui/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

export default class ActorsPage extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    const navigateTo = useNavigateToResource();
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
                    selectedItems={[]}
                    onChange={(c) => {
                      navigateTo.actors({
                        id: c[0].id,
                      });
                    }}
                  />

                  <ActorList
                    actors={acts.map((a) => ({
                      ...a,
                      selected: false,
                    }))}
                    onActorClick={(a) => {
                      navigateTo.actors({ id: a.id });
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
