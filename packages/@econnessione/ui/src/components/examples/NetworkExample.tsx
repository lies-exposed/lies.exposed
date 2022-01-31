import { actors } from "@econnessione/shared/mock-data/actors";
import { groups } from "@econnessione/shared/mock-data/groups";
import * as O from "fp-ts/lib/Option";
import * as React from "react";
import { EventsNetworkGraph } from "../Graph/EventsNetworkGraph";

const NetworkExample: React.FC = () => {
  const [showKeywordLinks, setShowKeywordLinks] =
    React.useState<boolean>(false);
  const [showActorLinks, setShowActorLinks] = React.useState<boolean>(false);
  const [showGroupLinks, setGroupsShowLinks] = React.useState<boolean>(false);

  const onShowLinks = (key: "keywords" | "actors" | "groups"): void => {
    switch (key) {
      case "keywords": {
        setShowKeywordLinks(!showKeywordLinks);
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

  const selectedKeywordIds = showKeywordLinks ? [].map((t: any) => t.id) : [];
  const selectedActorIds = showActorLinks ? actors.map((a) => a.id) : [];
  const selectedGroupIds = showGroupLinks ? groups.map((g) => g.id) : [];

  return (
    <>
      <button onClick={() => onShowLinks("keywords")}>
        {!showKeywordLinks ? "show" : "hide"} keywords links
      </button>
      <button onClick={() => onShowLinks("actors")}>
        {!showActorLinks ? "show" : "hide"} actors links
      </button>
      <button onClick={() => onShowLinks("groups")}>
        {!showGroupLinks ? "show" : "hide"} groups links
      </button>
      <EventsNetworkGraph
        groupBy="actor"
        scale={"all"}
        scalePoint={O.none}
        events={[]}
        actors={actors.map((a) => ({
          ...a,
          body: { content: "empty" },
        }))}
        groups={groups.map((g) => ({
          ...g,
          body: { content: "empty" },
        }))}
        keywords={[]}
        selectedActorIds={selectedActorIds}
        selectedGroupIds={selectedGroupIds}
        selectedKeywordIds={selectedKeywordIds}
        onEventClick={() => {}}
      />
    </>
  );
};

export default NetworkExample;
