import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { Loader } from "@liexp/ui/components/Common/Loader";
import { EventPageContent } from "@liexp/ui/components/EventPageContent";
import { Queries } from "@liexp/ui/providers/DataProvider";
import { Box } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { useNavigateToResource } from "../utils/location.utils";

const EventTemplate: React.FC<{ eventId: string }> = ({ eventId }) => {
  const navigateTo = useNavigateToResource();

  return (
    <WithQueries
      queries={{
        event: Queries.Event.get,
      }}
      params={{
        event: { id: eventId },
      }}
      render={QR.fold(Loader, ErrorBox, ({ event }) => {
        return (
          <Box style={{ margin: 20, marginBottom: 100 }}>
            <EventPageContent
              event={event as any}
              onGroupClick={(g) => {
                navigateTo.groups({ id: g.id });
              }}
              onKeywordClick={(k) => {
                navigateTo.keywords({ id: k.id });
              }}
              onActorClick={(a) => {
                navigateTo.actors({ id: a.id });
              }}
              onGroupMemberClick={(g) => {
                navigateTo.actors({ id: g.actor.id });
              }}
              onLinkClick={() => {}}
            />
          </Box>
        );
      })}
    />
  );
};

export default EventTemplate;
