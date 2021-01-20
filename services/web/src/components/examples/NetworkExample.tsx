import { EventsNetwork } from "@components/Graph/EventsNetwork";
import { Events } from "@econnessione/shared/lib/io/http";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import { actors } from "mock-data/actors";
import { events } from "mock-data/events";
import { groups } from "mock-data/groups";
import { topics } from "mock-data/topics";
import * as React from "react";

const NetworkExample: React.FC = () => {
  const [showTopicLinks, setShowTopicLinks] = React.useState<boolean>(false);
  const [showActorLinks, setShowActorLinks] = React.useState<boolean>(false);
  const [showGroupLinks, setGroupsShowLinks] = React.useState<boolean>(false);

  const onShowLinks = (key: "topic" | "actors" | "groups"): void => {
    switch (key) {
      case "topic": {
        setShowTopicLinks(!showTopicLinks);
        break;
      }
      case "actors": {
        setShowActorLinks(!showActorLinks);
        break;
      }
      case "groups": {
        setGroupsShowLinks(!showGroupLinks);
        break;
      }
    }
  };

  const selectedTopicIds = showTopicLinks ? topics.map((t) => t.id) : [];
  const selectedActorIds = showActorLinks ? actors.map((a) => a.id) : [];
  const selectedGroupIds = showGroupLinks ? groups.map((g) => g.id) : [];

  return (
    <>
      <button onClick={() => onShowLinks("topic")}>
        {!showTopicLinks ? "show" : "hide"} topic links
      </button>
      <button onClick={() => onShowLinks("actors")}>
        {!showActorLinks ? "show" : "hide"} actors links
      </button>
      <button onClick={() => onShowLinks("groups")}>
        {!showGroupLinks ? "show" : "hide"} groups links
      </button>
      <EventsNetwork
        scale={"all"}
        scalePoint={O.none}
        events={pipe(events, A.filter(Events.Uncategorized.Uncategorized.is))}
        actors={actors.map((a) => ({
          ...a,
          avatar: O.toUndefined(a.avatar),
          body: "empty",
        }))}
        selectedActorIds={selectedActorIds}
        selectedGroupIds={selectedGroupIds}
        selectedTopicIds={selectedTopicIds}
      />
    </>
  );
};

export default NetworkExample;
