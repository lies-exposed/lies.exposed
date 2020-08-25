import ActorList from "@components/lists/ActorList"
import TopicList from "@components/lists/TopicList"
import { EventPoint } from "@models/event"
import { formatDate } from "@utils/date"
import { AxisBottom } from "@vx/axis"
// import { RectClipPath } from "@vx/clip-path"
import { localPoint } from "@vx/event"
import { Group } from "@vx/group"
import { Graph } from "@vx/network"
import { Graph as GraphType } from "@vx/network/lib/types"
import { scaleTime } from "@vx/scale"
import { Tooltip } from "@vx/tooltip"
import withTooltip, {
  WithTooltipProvidedProps,
} from "@vx/tooltip/lib/enhancers/withTooltip"
import { LabelSmall, LabelMedium } from "baseui/typography"
import { ScaleTime } from "d3-scale"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import LinkEvent, { LinkEventProps } from "./LinkEventNode"
import NetworkNode, { NetworkNodeProps } from "./NetworkEventNode"

const backgroundColor = "#28272c"

function numTicksForWidth(width: number): number {
  if (width <= 300) return 2
  if (width > 300 && width <= 400) return 5
  return 10
}

export type NetworkScale = "all" | "year" | "month" | "week" | "day"

export type NetworkGraphType = GraphType<
  LinkEventProps,
  NetworkNodeProps["node"]
>

export interface NetworkBaseProps {
  width: number
  height: number
  scale: NetworkScale
  minDate: Date
  maxDate: Date
  graph: NetworkGraphType
  onEventLabelClick: (event: string) => void
  onNodeClick: (event: EventPoint) => void
  onDoubleClick: (event: EventPoint, scale: NetworkScale) => void
}

export type NetworkProps = NetworkBaseProps &
  WithTooltipProvidedProps<NetworkNodeProps["node"]["data"]>

class Network extends React.Component<NetworkProps, {}> {
  constructor(props: NetworkProps) {
    super(props)
    this.state = {}
  }

  handleMouseOver = (event: any, datum: any): void => {
    const coords = localPoint(event.target.ownerSVGElement, event)
    if (coords !== null) {
      if (
        this.props.showTooltip !== undefined &&
        this.props.tooltipLeft !== coords.x &&
        this.props.tooltipTop !== coords.y
      ) {
        this.props.showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: datum,
        })
      }
    }
  }

  render(): React.ReactElement | null {
    const {
      props: {
        width,
        height,
        graph,
        minDate,
        maxDate,
        onNodeClick,
        hideTooltip,
        tooltipOpen,
        tooltipTop,
        tooltipLeft,
        tooltipData,
      },
    } = this

    const getXScale = (): ScaleTime<number, number> =>
      scaleTime({
        range: [0, width],
        domain: [minDate, maxDate],
        nice: true,
      })

    return (
      <React.Fragment>
        <Group>
          <svg width={width} height={height} style={{ cursor: "grab" }}>
            {/* <RectClipPath id="zoom-clip" width={300} height={200} /> */}
            <rect
              width={width}
              height={height}
              rx={7}
              fill={backgroundColor}
              stroke={backgroundColor}
              strokeWidth="3"
            />
            <rect
              width={width}
              height={height}
              rx={7}
              fill="transparent"
              onDoubleClick={(event) => {
                const point = localPoint(event)
                if (point !== null) {
                  const [first, last] = A.splitAt(1)(graph.nodes)
                  const nearestPoint = last.reduce<EventPoint>((acc, n) => {
                    if (Math.abs(acc.x - point.x) < Math.abs(n.x - point.x)) {
                      return acc
                    }
                    return n
                  }, first[0])

                  if (nearestPoint !== undefined) {
                    this.props.onDoubleClick(nearestPoint, this.props.scale)
                  }
                }
              }}
            />
            <AxisBottom
              left={0}
              top={height - 30}
              scale={getXScale() as any}
              hideZero
              numTicks={numTicksForWidth(width)}
              label="Date"
              labelProps={{
                fill: "#fff",
                textAnchor: "middle",
                fontSize: 12,
                fontFamily: "Arial",
              }}
              stroke="#ff0"
              tickStroke="#ff0"
              tickLabelProps={(value, index) => ({
                fill: "#fff",
                textAnchor: "end",
                fontSize: 10,
                fontFamily: "Arial",
              })}
              tickComponent={({ formattedValue, ...tickProps }) => (
                <text {...tickProps}>{formattedValue}</text>
              )}
            />

            <Graph
              graph={graph}
              linkComponent={(props) => LinkEvent(props.link)}
              nodeComponent={(props) =>
                NetworkNode({
                  ...props,
                  onMouseOver: this.handleMouseOver,
                  onMouseOut: hideTooltip,
                  onClick: onNodeClick,
                })
              }
            />
          </svg>
        </Group>
        {tooltipOpen && tooltipData !== undefined ? (
            <Tooltip
              key={Math.random()}
              top={tooltipTop}
              left={tooltipLeft}
              style={{
                maxWidth: 300,
                minWidth: 300,
                position: "absolute",
                backgroundColor: "white",
                zIndex: 100
              }}
            >
              <div>
                <LabelMedium>{tooltipData.frontmatter.title}</LabelMedium>
                <LabelSmall>
                  Data: {formatDate(tooltipData.frontmatter.date)}
                </LabelSmall>
                <div>
                  <TopicList
                    topics={tooltipData.fields.topics.map((t) => ({
                      ...t,
                      selected: false,
                    }))}
                    onTopicClick={() => {}}
                  />
                </div>
                {pipe(
                  tooltipData.fields.actors,
                  O.map((actors) => (
                    <ActorList
                      key="actors"
                      actors={actors.map((a) => ({ ...a, selected: false }))}
                      onActorClick={() => {}}
                      avatarScale="scale1000"
                    />
                  )),
                  O.toNullable
                )}
              </div>
            </Tooltip>
          ) : null}
      </React.Fragment>
    )
  }
}

export default withTooltip<NetworkBaseProps, NetworkNodeProps["node"]["data"]>(
  Network
)
