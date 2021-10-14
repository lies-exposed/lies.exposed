import { LazyFullSizeLoader } from "@components/Common/FullSizeLoader";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { EventPageContent } from "@econnessione/ui/components/EventPageContent";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { doUpdateCurrentView } from "utils/location.utils";

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
          <WithQueries
            queries={{
              actors: Queries.Actor.getList,
              groups: Queries.Group.getList,
              links: Queries.Link.getList,
              keywords: Queries.Keyword.getList,
            }}
            params={{
              actors: {
                pagination: { perPage: 20, page: 1 },
                sort: { order: "DESC", field: "id" },
                filter: {
                  ids: (event as any).actors,
                },
              },
              groups: {
                pagination: { perPage: 20, page: 1 },
                sort: { order: "DESC", field: "id" },
                filter: {
                  ids: (event as any).groups,
                },
              },
              links: {
                pagination: { perPage: 20, page: 1 },
                sort: { order: "DESC", field: "id" },
                filter: {
                  ids: (event as any).links,
                },
              },
              keywords: {
                pagination: { perPage: 20, page: 1 },
                sort: { order: "DESC", field: "tag" },
                filter: {
                  ids: (event as any).keywords,
                },
              },
            }}
            render={QR.fold(
              LazyFullSizeLoader,
              ErrorBox,
              ({
                actors: { data: actors },
                groups: { data: groups },
                links: { data: links },
                keywords: { data: keywords },
              }) => {
                return (
                  <EventPageContent
                    event={event as any}
                    actors={actors}
                    groups={groups}
                    links={links}
                    keywords={keywords}
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
                );
              }
            )}
          />
        );
      })}
    />
  );
};

export default EventTemplate;
