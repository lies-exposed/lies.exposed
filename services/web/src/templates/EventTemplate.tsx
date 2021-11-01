import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { EventPageContent } from "@econnessione/ui/components/EventPageContent";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import { Box } from "@material-ui/core";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { doUpdateCurrentView } from "../utils/location.utils";

const EventTemplate: React.FC<{ eventId: string }> = ({ eventId }) => {
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
          <Box>
            <EventPageContent
              event={event as any}
              onActorClick={(a) => {
                void doUpdateCurrentView({
                  view: "actor",
                  actorId: a.id,
                })();
              }}
              onGroupClick={(g) => {
                void doUpdateCurrentView({
                  view: "group",
                  groupId: g.id,
                })();
              }}
              onLinkClick={() => {}}
              onKeywordClick={(k) => {
                void doUpdateCurrentView({
                  view: "keyword",
                  keywordId: k.id,
                })();
              }}
            />
          </Box>
        );
      })}
    />
  );
};

export default EventTemplate;
