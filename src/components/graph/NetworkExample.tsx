import Network from "@components/Network/Network"
import { createNetworkTemplateProps } from "@templates/NetworkTemplate/createNetworkTemplateProps"
import { generateRandomColor } from "@utils/colors"
import { throwValidationErrors } from "@utils/throwValidationErrors"
import { LegendItem, LegendLabel, LegendOrdinal } from "@vx/legend"
import * as E from "fp-ts/lib/Either"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import moment from "moment"
import * as React from "react"
import { v1 as uuidv1 } from "uuid"

// topics
const firstTopic = {
  uuid: uuidv1(),
  label: "First Topic",
  slug: "first-topic",
  cover: undefined,
  color: generateRandomColor(),
  date: new Date().toISOString(),
}

const secondTopic = {
  uuid: uuidv1(),
  label: "Second Topic",
  slug: "second-topic",
  cover: undefined,
  color: generateRandomColor(),
  date: new Date().toISOString(),
}

const thirdTopic = {
  uuid: uuidv1(),
  label: "Third Topic",
  slug: "third-topic",
  cover: undefined,
  color: generateRandomColor(),
  date: new Date().toISOString(),
}

const topics = [firstTopic, secondTopic, thirdTopic]

const firstActor = {
  uuid: uuidv1(),
  fullName: "First Actor",
  username: "first-actor",
  date: new Date().toISOString(),
  color: generateRandomColor(),
}

const secondActor = {
  uuid: uuidv1(),
  fullName: "Second Actor",
  username: "second-actor",
  date: new Date().toISOString(),
  color: generateRandomColor(),
}

const actors = [firstActor, secondActor]

const firstGroup = {
  uuid: uuidv1(),
  name: "First Group",
  date: new Date().toISOString(),
  color: generateRandomColor(),
}

const secondGroup = {
  uuid: uuidv1(),
  name: "Second Group",
  date: new Date().toISOString(),
  color: generateRandomColor(),
}

const groups = [firstGroup, secondGroup]

// events

const events = [
  {
    uuid: uuidv1(),
    title: "First Event",
    topics: [firstTopic],
    actors: [secondActor, firstActor],
    groups: [firstGroup],
    links: [],
    date: moment().subtract(2, "month").toISOString(),
  },
  {
    uuid: uuidv1(),
    title: "Second Event",
    topics: [secondTopic],
    actors: [secondActor],
    links: [],
    date: moment().subtract(2, "month").toISOString(),
  },
  {
    uuid: uuidv1(),
    title: "Third Event",
    topics: [secondTopic, thirdTopic],
    actors: [secondActor],
    groups: [firstGroup],
    links: [],
    date: moment().subtract(3, "week").toISOString(),
  },
  {
    uuid: uuidv1(),
    title: "Fourth Event",
    topics: [firstTopic, secondTopic],
    actors: [secondActor],
    groups: [secondGroup],
    links: [],
    date: new Date().toISOString(),
  },
].map((e) => ({
  frontmatter: e,
  htmlAst: {},
  tableOfContents: "",
  timeToRead: 1,
}))

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

  return pipe(
    createNetworkTemplateProps({
      data: { events: { nodes: events } },
      selectedTopicIds,
      selectedActorIds,
      selectedGroupIds,
      scale: "all",
      scalePoint: O.none,
      minDate: O.some(moment().subtract(3, "month").toDate()),
      maxDate: O.some(new Date()),
      height: 300,
      width: 600,
      margin: { vertical: 20, horizontal: 20 },
    }),
    E.fold(
      throwValidationErrors,
      ({
        networkWidth,
        scale,
        minDate,
        maxDate,
        graph,
        topicsScale,
        actorsScale,
        groupsScale,
      }) => (
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
          <Network
            graph={graph}
            width={networkWidth}
            height={300}
            scale={scale}
            minDate={minDate}
            maxDate={maxDate}
            onEventLabelClick={() => {}}
            onDoubleClick={() => {}}
            onNodeClick={() => {}}
          />

          <div className="legends">
            <LegendDemo title="Topics">
              <LegendOrdinal scale={topicsScale} labelFormat={(datum) => datum}>
                {(labels) => {
                  return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {labels.map((label, i) => (
                        <LegendItem
                          key={`legend-quantile-${i}`}
                          margin="0 5px"
                          onClick={() => {}}
                        >
                          <svg width={10} height={10}>
                            <circle
                              fill={`#${label.value}`}
                              r={4}
                              cy={4}
                              cx={4}
                            />
                          </svg>
                          <LegendLabel align="left" margin="0 0 0 4px">
                            {label.text}
                          </LegendLabel>
                        </LegendItem>
                      ))}
                    </div>
                  )
                }}
              </LegendOrdinal>
            </LegendDemo>
            <LegendDemo title="Actors">
              <LegendOrdinal scale={actorsScale} labelFormat={(datum) => datum}>
                {(labels) => {
                  return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {labels.map((label, i) => (
                        <LegendItem
                          key={`legend-quantile-${i}`}
                          margin="0 5px"
                          onClick={() => {}}
                        >
                          <svg width={10} height={2}>
                            <rect
                              fill={`#${label.value}`}
                              width={10}
                              height={2}
                            />
                          </svg>
                          <LegendLabel align="left" margin="0 0 0 4px">
                            {label.text}
                          </LegendLabel>
                        </LegendItem>
                      ))}
                    </div>
                  )
                }}
              </LegendOrdinal>
            </LegendDemo>
            <LegendDemo title="Groups">
              <LegendOrdinal<string, string>
                scale={groupsScale}
                labelFormat={(datum) => {
                  return datum
                }}
              >
                {(labels) => {
                  return (
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {labels.map((label, i) => (
                        <LegendItem
                          key={`legend-quantile-${i}`}
                          margin="0 5px"
                          onClick={() => {}}
                        >
                          <svg width={10} height={2}>
                            <rect
                              fill={`#${label.value}`}
                              width={10}
                              height={2}
                            />
                          </svg>
                          <LegendLabel align="left" margin="0 0 0 4px">
                            {label.text}
                          </LegendLabel>
                        </LegendItem>
                      ))}
                    </div>
                  )
                }}
              </LegendOrdinal>
            </LegendDemo>
            <style>{`
              .legends {
                font-family: arial;
                font-weight: 900;
                background-color: black;
                border-radius: 14px;
                padding: 24px 24px 24px 32px;
                overflow-y: auto;
                flex-grow: 1;
              }
              .chart h2 {
                margin-left: 10px;
              }
            `}</style>
          </div>
        </>
      )
    )
  )
}

function LegendDemo({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <div className="legend">
      <div className="title">{title}</div>
      {children}
      <style>{`
        .legend {
          line-height: 0.9em;
          color: #efefef;
          font-size: 10px;
          font-family: arial;
          padding: 10px 10px;
          float: left;
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          margin: 5px 5px;
        }
        .title {
          font-size: 12px;
          margin-bottom: 10px;
          font-weight: 100;
        }
      `}</style>
    </div>
  )
}

export default NetworkExample
