import { EventType } from "@liexp/shared/lib/io/http/Events/index.js";
import { GROUPS } from "@liexp/shared/lib/io/http/Group.js";
import { type NonEmptyArray } from "@liexp/shared/lib/utils/array.utils.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { AutocompleteGroupInput } from "@liexp/ui/lib/components/Input/AutocompleteGroupInput.js";
import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import GroupList from "@liexp/ui/lib/components/lists/GroupList.js";
import { Grid, Typography } from "@liexp/ui/lib/components/mui/index.js";
import { PageContentBox } from "@liexp/ui/lib/containers/PageContentBox.js";
import { GroupEventNetworkGraphBox } from "@liexp/ui/lib/containers/graphs/GroupEventNetworkGraphBox.js";
import { subYears } from "date-fns";
import * as React from "react";
import { type RouteProps as RouteComponentProps } from "react-router";
import { useNavigateToResource } from "../utils/location.utils.js";

const GroupsPage: React.FC<RouteComponentProps> = (props) => {
  const navigateTo = useNavigateToResource();
  return (
    <MainContent>
      <PageContentBox path="groups" />
      <AutocompleteGroupInput
        selectedItems={[]}
        onChange={(gg) => {
          navigateTo.groups({
            id: gg[0].id,
          });
        }}
      />
      <QueriesRenderer
        queries={(Q) => ({
          groups: Q.Group.list.useQuery(
            {
              pagination: { page: 1, perPage: 40 },
              sort: { field: "id", order: "ASC" },
            },
            undefined,
            false,
          ),
        })}
        render={({ groups: { data: groups, total } }) => (
          <>
            <Typography variant="subtitle1">{total}</Typography>
            <GroupList
              style={{
                display: "flex",
                flexDirection: "row",
                flexWrap: "wrap",
              }}
              groups={groups.map((a) => ({
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
              <Grid size={{ md: 12 }} style={{ height: "100%" }}>
                <GroupEventNetworkGraphBox
                  showRelations={false}
                  params={{
                    sort: { field: "updatedAt", order: "DESC" },
                    pagination: {
                      perPage: 1,
                      page: 1,
                    },
                  }}
                  type={GROUPS.literals[0]}
                  count={100}
                  relations={[GROUPS.literals[0]]}
                  selectedGroupIds={groups.map((g) => g.id)}
                  query={{
                    eventType: EventType.members.map(
                      (t) => t.literals[0],
                    ) as unknown as NonEmptyArray<EventType>,
                    startDate: formatDate(subYears(new Date(), 2)),
                    endDate: formatDate(new Date()),
                  }}
                  onGroupClick={(g) => {
                    navigateTo.groups({
                      id: g.id,
                    });
                  }}
                  onActorClick={(a) => {
                    navigateTo.actors({
                      id: a.id,
                    });
                  }}
                  onEventClick={(e) => {
                    navigateTo.events({
                      id: e.id,
                    });
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
