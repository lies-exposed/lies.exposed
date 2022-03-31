import { EventType } from "@liexp/shared/io/http/Events";
import { ActorPageContent } from "@liexp/ui/components/ActorPageContent";
import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { LazyFullSizeLoader } from "@liexp/ui/components/Common/FullSizeLoader";
import { MainContent } from "@liexp/ui/components/MainContent";
import SEO from "@liexp/ui/components/SEO";
import ActorsBox from "@liexp/ui/containers/ActorsBox";
import { Queries } from "@liexp/ui/providers/DataProvider";
import { Box, Typography } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import subYears from "date-fns/sub_years";
import * as React from "react";
import { useRouteQuery } from "../utils/history.utils";
import { useNavigateToResource } from "../utils/location.utils";
import { EventsPanel } from "@containers/EventsPanel";

const ActorTemplate: React.FC<{ actorId: string }> = ({
  actorId,
  ...props
}) => {
  const navigateToResource = useNavigateToResource();
  const { tab } = useRouteQuery<{ tab?: string }>();

  return (
    <WithQueries
      queries={{
        actor: Queries.Actor.get,
        groups: Queries.Group.getList,
      }}
      params={{
        actor: { id: actorId },
        groups: {
          pagination: { perPage: 100, page: 1 },
          sort: { field: "createdAt", order: "DESC" },
          filter: { members: [actorId] },
        },
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ actor, groups: { data: groups } }) => {
          return (
            <Box>
              <MainContent>
                <SEO
                  title={actor.fullName}
                  image={actor.avatar ?? ""}
                  urlPath={`/actors/${actor.id}`}
                />
                <ActorPageContent
                  actor={actor}
                  groups={groups}
                  onGroupClick={(g) => navigateToResource.groups({ id: g.id })}
                />
                <EventsPanel
                  hash={`actor-${actorId}`}
                  query={{
                    startDate: subYears(new Date(), 1).toDateString(),
                    endDate: new Date().toDateString(),
                    actors: [actorId],
                    groups: [],
                    groupsMembers: [],
                    keywords: [],
                    tab:
                      typeof tab === "string"
                        ? parseInt(tab, 10)
                        : (tab as any),
                    type: EventType.types.map((t) => t.value),
                  }}
                  onQueryChange={({ tab }) => {
                    navigateToResource.actors({ id: actor.id }, { tab });
                  }}
                />
                <Box>
                  <Typography variant="h4">Related actors</Typography>
                  <ActorsBox
                    style={{ display: "flex", flexDirection: "row" }}
                    params={{
                      sort: { field: "updatedAt", order: "DESC" },
                      pagination: {
                        page: 1,
                        perPage: 3,
                      },
                    }}
                    onItemClick={(a) => {
                      navigateToResource.actors({ id: a.id });
                    }}
                  />
                </Box>
              </MainContent>
            </Box>
          );
        }
      )}
    />
  );
};

export default ActorTemplate;
