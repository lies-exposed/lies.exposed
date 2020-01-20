import * as React from "react"
import { Graph } from "@vx/network"
import { Graph as GraphType } from "@vx/network/lib/types"
import { localPoint } from "@vx/event"
import withTooltip, {
  WithTooltipProvidedProps,
} from "@vx/tooltip/lib/enhancers/withTooltip"
import { TooltipWithBounds } from "@vx/tooltip"
import { Group } from "@vx/group"
import { AxisBottom } from "@vx/axis"
import { scaleTime } from "@vx/scale"
import NetworkNode, { NetworkNodeProps } from "./NetworkEventNode"
import { RectClipPath } from "@vx/clip-path"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { EventPoint } from "../../../types/event"
import { formatDate } from "../../../utils/date"
import LinkEvent, { LinkEventProps } from "./LinkEventNode"
import * as A from "fp-ts/lib/Array"

function numTicksForWidth(width: number): number {
  if (width <= 300) return 2
  if (300 < width && width <= 400) return 5
  return 10
}

export type NetworkScale = "all" | "year" | "month" | "week" | "day"

export interface NetworkProps
  extends Omit<WithTooltipProvidedProps, "tooltipData"> {
  width: number
  height: number
  scale: NetworkScale
  minDate: Date
  maxDate: Date
  graph: GraphType<LinkEventProps, NetworkNodeProps["node"]>
  tooltipData?: NetworkNodeProps["node"]["data"]
  onEventLabelClick: (event: string) => void
  onNodeClick: (event: EventPoint) => void
  onDoubleClick: (event: EventPoint, scale: NetworkScale) => void
}

interface NetworkState {}

class Network extends React.Component<NetworkProps, NetworkState> {
  constructor(props: NetworkProps) {
    super(props)
    this.state = {}
  }

  handleMouseOver = (event: any, datum: any) => {
    const coords = localPoint(event.target.ownerSVGElement, event)
    if (coords) {
      this.props.showTooltip &&
        this.props.showTooltip({
          tooltipLeft: coords.x,
          tooltipTop: coords.y,
          tooltipData: datum,
        })
    }
  }

  render() {
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

    const getXScale = () =>
      scaleTime({
        range: [0, width],
        domain: [minDate, maxDate],
        nice: true,
      })

    return (
      <React.Fragment>
        <Group>
          <svg width={width} height={height} style={{ cursor: "grab" }}>
            <RectClipPath id="zoom-clip" width={300} height={200} />
            <rect width={width} height={height} rx={14} fill="#272b4d" />
            <rect
              width={width}
              height={height}
              rx={14}
              fill="transparent"
              onDoubleClick={event => {
                const point = localPoint(event)
                if (point) {
                  const [first, last] = A.splitAt(1)(graph.nodes)
                  const nearestPoint = last.reduce<EventPoint>((acc, n) => {
                    if (
                      acc &&
                      Math.abs(acc.x - point.x) < Math.abs(n.x - point.x)
                    ) {
                      return acc
                    }
                    return n
                  }, first[0])

                  if (nearestPoint) {
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
              linkComponent={props => LinkEvent(props.link)}
              nodeComponent={props =>
                NetworkNode({
                  ...props,
                  onMouseOver: this.handleMouseOver,
                  onMouseOut: hideTooltip,
                  onClick: onNodeClick,
                })
              }
            />
          </svg>
          {tooltipOpen && !!tooltipData && (
            <TooltipWithBounds
              key={Math.random()}
              top={tooltipTop}
              left={tooltipLeft}
              style={{ maxWidth: 200 }}
            >
              <div>
                <div>
                  <strong>{tooltipData.frontmatter.title}</strong>
                </div>
                <div>Data: {formatDate(tooltipData.frontmatter.date)}</div>
                {pipe(
                  tooltipData.frontmatter.actors,
                  O.map(actors => <div>Actors: {actors.join(", ")}</div>),
                  O.toNullable
                )}
                {pipe(
                  tooltipData.frontmatter.cover,
                  O.fold(
                    () => null,
                    c => (
                      <div>
                        {" "}
                        <img width={300} height="auto" src={c} />
                      </div>
                    )
                  )
                )}
              </div>
            </TooltipWithBounds>
          )}
        </Group>
      </React.Fragment>
    )
  }
}

export default withTooltip(Network)
