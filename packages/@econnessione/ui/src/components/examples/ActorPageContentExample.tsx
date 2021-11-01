import { goodActor } from "@econnessione/shared/mock-data/actors";
import { Card } from "@material-ui/core";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
// import { extractEventsMetadata } from "../../helpers/event";
// import { events } from "../../mock-data/events";
import { ActorPageContent, ActorPageContentProps } from "../ActorPageContent";

export const actorPageContentArgs: ActorPageContentProps = {
  actor: {
    ...goodActor,
    avatar: goodActor.avatar,
    body: "",
  },
  groups: [],
  onGroupClick: () => {},
};

export const ActorPageContentExample: React.FC<ActorPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as {})
    ? actorPageContentArgs
    : props;

  return (
    <Card>
      <ActorPageContent {...pageContentProps} />
    </Card>
  );
};
