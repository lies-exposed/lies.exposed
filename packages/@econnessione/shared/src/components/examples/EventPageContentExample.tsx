import { Card } from "@material-ui/core";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import { firstEvent } from "../../mock-data/events";
import { EventPageContent, EventPageContentProps } from "../EventPageContent";

export const eventPageContentArgs: EventPageContentProps = {
  event: {
    ...firstEvent,
    body: "",
  },
  actors: [],
  groups: [],
  links: [],
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
