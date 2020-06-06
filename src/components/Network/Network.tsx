import { EventPoint } from "@models/event"
import { formatDate } from "@utils/date"
import { AxisBottom } from "@vx/axis"
// import { RectClipPath } from "@vx/clip-path"
import { localPoint } from "@vx/event"
import { Group } from "@vx/group"
import { Graph } from "@vx/network"
import { Graph as GraphType } from "@vx/network/lib/types"
import { scaleTime } from "@vx/scale"
import { TooltipWithBounds } from "@vx/tooltip"
import withTooltip, {
  WithTooltipProvidedProps,
} from "@vx/tooltip/lib/enhancers/withTooltip"
import { ScaleTime } from "d3-scale"
import * as A from "fp-ts/lib/Array"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import LinkEvent, { LinkEventProps } from "./LinkEventNode"
import NetworkNode, { NetworkNodeProps } from "./NetworkEventNode"

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
      if (this.props.showTooltip !== undefined) {
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
          <svg
            width={width}
            height={height}
            style={{ cursor: "grab" }}
            onScroll={e => {
              e.stopPropagation()
            }}
          >
            {/* <RectClipPath id="zoom-clip" width={300} height={200} /> */}
            <rect
              width={width}
              height={height}
              rx={14}
              fill="#654abc"
              stroke="#654abc"
              strokeWidth="3"
            />
            <rect
              width={width}
              height={height}
              rx={14}
              fill="transparent"
              onDoubleClick={event => {
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
          {tooltipOpen && tooltipData !== undefined ? (
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
                  O.map(actors => (
                    <div key="actors">
                      Actors: {actors.map(a => a.fullName).join(", ")}
                    </div>
                  )),
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
          ) : null}
        </Group>
      </React.Fragment>
    )
  }
}

export default withTooltip<NetworkBaseProps, NetworkNodeProps["node"]["data"]>(
  Network
)
