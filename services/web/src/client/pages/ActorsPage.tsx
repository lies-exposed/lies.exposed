import { AutocompleteActorInput } from "@liexp/ui/components/Input/AutocompleteActorInput";
import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { ActorList } from "@liexp/ui/components/lists/ActorList";
import { useActorsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

export const queryParams = {
  pagination: { page: 1, perPage: 40 },
  sort: { field: "id", order: "ASC" },
  filter: {},
};

const ActorsPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();

  // const pageContentByPath = usePageContentByPathQuery({ path: "actors" });

  return (
    <>
      <QueriesRenderer
        queries={{
          actors: useActorsQuery(queryParams, false),
        }}
        render={({ actors: { data: actors } }) => {
          return (
            <MainContent>
              <PageContent path="actors" />
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
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                  }}
                  actors={actors.map((a) => ({
                    ...a,
                    selected: true,
                  }))}
                  onActorClick={(a) => {
                    navigateTo.actors({ id: a.id });
                  }}
                />
              </>
            </MainContent>
          );
        }}
      />
    </>
  );
};

export default ActorsPage;
