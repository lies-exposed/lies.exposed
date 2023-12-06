import { EventType } from "@liexp/shared/lib/io/http/Events";
import { GROUPS } from "@liexp/shared/lib/io/http/Group";
import { formatDate } from "@liexp/shared/lib/utils/date.utils";
import { AutocompleteGroupInput } from "@liexp/ui/lib/components/Input/AutocompleteGroupInput";
import { MainContent } from "@liexp/ui/lib/components/MainContent";
import { PageContent } from "@liexp/ui/lib/components/PageContent";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import GroupList from "@liexp/ui/lib/components/lists/GroupList";
import { Grid, Typography } from "@liexp/ui/lib/components/mui";
import { GroupEventNetworkGraphBox } from "@liexp/ui/lib/containers/graphs/GroupEventNetworkGraphBox";
import { useGroupsQuery } from "@liexp/ui/lib/state/queries/groups.queries";
import { type RouteComponentProps } from "@reach/router";
import { subYears } from "date-fns";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const GroupsPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();
  return (
    <MainContent>
      <PageContent path="groups" />
      <AutocompleteGroupInput
        selectedItems={[]}
        onChange={(gg) => {
          navigateTo.groups({
            id: gg[0].id,
          });
        }}
      />
      <QueriesRenderer
        queries={{
          groups: useGroupsQuery(
            {
              pagination: { page: 1, perPage: 20 },
              sort: { field: "id", order: "ASC" },
              filter: {},
            },
            false,
          ),
        }}
        render={({ groups }) => (
          <>
            <Typography variant="subtitle1">{groups.total}</Typography>
            <GroupList
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
              groups={groups.data.map((a) => ({
                ...a,
                selected: true,
              }))}
              onItemClick={(g) => {
                navigateTo.groups({
                  id: g.id,
                });
              }}
            />
            <Grid container style={{ height: 600 }}>
              <Grid item md={6} style={{ height: "100%" }}>
                <GroupEventNetworkGraphBox
                  showRelations={false}
                  params={{
                    sort: { field: "updatedAt", order: "DESC" },
                    pagination: {
                      perPage: 1,
                      page: 1,
                    },
                  }}
                  type={GROUPS.value}
                  query={{
                    eventType: EventType.types.map((t) => t.value),
                    startDate: formatDate(subYears(new Date(), 2)),
                    endDate: formatDate(new Date()),
                  }}
                />
              </Grid>
            </Grid>
          </>
        )}
      />
    </MainContent>
  );
};

export default GroupsPage;
