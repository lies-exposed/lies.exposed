import { AutocompleteGroupInput } from "@liexp/ui/components/Input/AutocompleteGroupInput";
import { MainContent } from "@liexp/ui/components/MainContent";
import { PageContent } from "@liexp/ui/components/PageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import GroupList from "@liexp/ui/components/lists/GroupList";
import { Typography } from "@liexp/ui/components/mui";
import { useGroupsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { type RouteComponentProps } from "@reach/router";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const GroupsPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();
  return (
    <MainContent>
      <PageContent path="groups" />
      <QueriesRenderer
        queries={{
          groups: useGroupsQuery(
            {
              pagination: { page: 1, perPage: 20 },
              sort: { field: "id", order: "ASC" },
              filter: {},
            },
            false
          ),
        }}
        render={({ groups }) => (
          <>
            <AutocompleteGroupInput
              selectedItems={[]}
              onChange={(gg) => {
                navigateTo.groups({
                  id: gg[0].id,
                });
              }}
            />
            <Typography variant="subtitle1">{groups.total}</Typography>
            <GroupList
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
              groups={groups.data.map((a) => ({
                ...a,
                selected: false,
              }))}
              onItemClick={(g) => {
                navigateTo.groups({
                  id: g.id,
                });
              }}
            />
          </>
        )}
      />
    </MainContent>
  );
};

export default GroupsPage;
