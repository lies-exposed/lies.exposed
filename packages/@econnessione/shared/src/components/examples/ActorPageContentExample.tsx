import { Card } from "baseui/card";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import { extractEventsMetadata } from "../../helpers/event";
import { goodActor } from "../../mock-data/actors";
import { events } from "../../mock-data/events";
import {
  ActorPageContent,
  ActorPageContentProps
} from "../ActorPageContent";

export const actorPageContentArgs: ActorPageContentProps = {
  ...goodActor,
  avatar: goodActor.avatar,
  body: "",
  // tableOfContents: O.none,
  // timeToRead: O.none,
  metadata: extractEventsMetadata({ type: "Actor", elem: goodActor })(events),
};

export const ActorPageContentExample: React.FC<ActorPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as {})
    ? actorPageContentArgs
    : props;

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <ActorPageContent {...pageContentProps} />
    </Card>
  );
};
