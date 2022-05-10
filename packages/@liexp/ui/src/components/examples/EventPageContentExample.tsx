import { firstEvent } from "@liexp/shared/mock-data/events";
import { Card } from "@mui/material";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import { EventPageContent, EventPageContentProps } from "../EventPageContent";

export const eventPageContentArgs: EventPageContentProps = {
  event: {
    ...firstEvent,
    type: "Uncategorized",
    payload: {
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
