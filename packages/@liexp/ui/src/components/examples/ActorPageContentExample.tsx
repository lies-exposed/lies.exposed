import { goodActor } from "@liexp/shared/mock-data/actors";
import * as R from "fp-ts/Record";
import * as React from "react";
// import { extractEventsMetadata } from "../../helpers/event";
// import { events } from "../../mock-data/events";
import { ActorPageContent, ActorPageContentProps } from "../ActorPageContent";
import { Card } from "../mui";

export const actorPageContentArgs: ActorPageContentProps = {
  actor: {
    ...goodActor,
    avatar: goodActor.avatar,
    body: { content: "" },
  },
  groups: [],
  onGroupClick: () => {},
  onActorClick: () => {},
  hierarchicalGraph: {
    onNodeClick: () => {},
    onLinkClick: () => {},
  },
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
