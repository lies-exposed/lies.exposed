import { EventsNetwork } from "@components/Graph/EventsNetwork"
import { actors } from "data/actors"
import { events } from "data/events"
import { groups } from "data/groups"
import { topics } from "data/topics"
import * as O from "fp-ts/lib/Option"
import * as React from "react"

const NetworkExample: React.FC = () => {
  const [showTopicLinks, setShowTopicLinks] = React.useState<boolean>(false)
  const [showActorLinks, setShowActorLinks] = React.useState<boolean>(false)
  const [showGroupLinks, setGroupsShowLinks] = React.useState<boolean>(false)

  const onShowLinks = (key: "topic" | "actors" | "groups"): void => {
    switch (key) {
      case "topic": {
        setShowTopicLinks(!showTopicLinks)
        break
      }
      case "actors": {
        setShowActorLinks(!showActorLinks)
        break
      }
      case "groups": {
        setGroupsShowLinks(!showGroupLinks)
        break
      }
    }
  }

  const selectedTopicIds = showTopicLinks ? topics.map((t) => t.uuid) : []
  const selectedActorIds = showActorLinks ? actors.map((a) => a.uuid) : []
  const selectedGroupIds = showGroupLinks ? groups.map((g) => g.uuid) : []

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
        width={1000}
        height={300}
        scale={"all"}
        scalePoint={O.none}
        events={events.map((f) => ({
          tableOfContents: "",
          frontmatter: f,
          timeToRead: 1,
          htmlAst: {},
        }))}
        selectedActorIds={selectedActorIds}
        selectedGroupIds={selectedGroupIds}
        selectedTopicIds={selectedTopicIds}
        margin={{ vertical: 10, horizontal: 10}}
      />
    </>
  )
}

export default NetworkExample
