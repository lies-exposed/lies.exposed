import { firstEvent } from "@econnessione/shared/mock-data/events";
import { Card } from "@material-ui/core";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import { EventPageContent, EventPageContentProps } from "../EventPageContent";

export const eventPageContentArgs: EventPageContentProps = {
  event: {
    ...firstEvent,
    type: "Uncategorized",
    payload: {
      title: "fale title",
      endDate: undefined,
      location: undefined,
      ...firstEvent.payload,
      actors: [],
      groups: [],
      groupsMembers: [],
    },
    media: [],
    keywords: [],
    links: [],
  },
  onActorClick: () => undefined,
  onGroupClick: () => undefined,
  onKeywordClick: () => undefined,
  onGroupMemberClick: () => undefined,
  onLinkClick: () => undefined,
};

export const EventPageContentExample: React.FC<EventPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as {})
    ? eventPageContentArgs
    : props;

  return (
    <Card>
      <EventPageContent {...pageContentProps} />
    </Card>
  );
};
