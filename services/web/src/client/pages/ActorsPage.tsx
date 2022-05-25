import { AutocompleteActorInput } from "@liexp/ui/components/Input/AutocompleteActorInput";
import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import { ActorList } from "@liexp/ui/components/lists/ActorList";
import {
  useActorsQuery,
} from "@liexp/ui/state/queries/DiscreteQueries";
import { RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const ActorsPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();

  const actors = useActorsQuery({
    pagination: { page: 1, perPage: 20 },
    sort: { field: "id", order: "ASC" },
    filter: {},
  });

  // const pageContentByPath = usePageContentByPathQuery({ path: "actors" });

  return (
    <>
      <MainContent>
        <PageContent path="actors" />
        {actors.data ? (
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
              }}
              actors={actors.data.data.map((a) => ({
                ...a,
                selected: false,
              }))}
              onActorClick={(a) => {
                navigateTo.actors({ id: a.id });
              }}
            />
          </>
        ) : null}
      </MainContent>
    </>
  );
};

export default ActorsPage;
