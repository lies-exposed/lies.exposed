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
import { scaleTime, scaleOrdinal } from "@vx/scale"
import NetworkNode, { NetworkNodeProps } from "./NetworkEventNode"
import { Zoom } from "@vx/zoom"
import { RectClipPath } from "@vx/clip-path"
import { Legend } from "@vx/legend"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import { EventPoint } from "../../../types/event"
import { formatDate } from "../../../utils/date"
import LinkEvent, { LinkEventProps } from "./LinkEventNode"
import { TopicPoint } from "../../../types/topic"

function numTicksForWidth(width: number): number {
  if (width <= 300) return 2
  if (300 < width && width <= 400) return 5
  return 10
}

interface NetworkProps extends Omit<WithTooltipProvidedProps, "tooltipData"> {
  width: number
  height: number
  minDate: Date
  maxDate: Date
  topics: TopicPoint[]
  graph: GraphType<LinkEventProps, NetworkNodeProps["node"]>
  tooltipData?: NetworkNodeProps["node"]["data"]
  onEventLabelClick: (event: string) => void;
  onNodeClick: (event: EventPoint) => void
}

const initialTransform = {
  scaleX: 0.8,
  scaleY: 0.8,
  translateX: 0,
  translateY: 0,
  skewX: 0,
  skewY: 0,
}

interface NetworkState {
  showMiniMap: boolean
}

class Network extends React.Component<NetworkProps, NetworkState> {
  constructor(props: NetworkProps) {
    super(props)
    this.state = { showMiniMap: true }
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

  toggleMiniMap = () => {
    this.setState(prevState => {
      return {
        showMiniMap: !prevState.showMiniMap,
      }
    })
  }

  render() {
    const {
      props: {
        width,
        height,
        graph,
        minDate,
        maxDate,
        topics,
        onNodeClick,
        hideTooltip,
        tooltipOpen,
        tooltipTop,
        tooltipLeft,
        tooltipData,
      },
      state: { showMiniMap },
    } = this

    const eventsOrdinalScale = scaleOrdinal({
      range: topics.map(t => t.fill),
      domain: topics.map(t => t.label),
    })

    const getXScale = () =>
      scaleTime({
        range: [0, width],
        domain: [minDate, maxDate],
        nice: true,
      })
    
    return (
      <React.Fragment>
        <Zoom
          width={width}
          height={height}
          scaleXMin={1 / 2}
          scaleXMax={4}
          scaleYMin={1 / 2}
          scaleYMax={4}
          transformMatrix={initialTransform}
        >
          {zoom => {
            return (
              <Group>
                <svg width={width} height={height} style={{ cursor: "grab" }}>
                  <RectClipPath id="zoom-clip" width={300} height={200} />
                  <rect width={width} height={height} rx={14} fill="#272b4d" />
                  <rect
                    width={width}
                    height={height}
                    rx={14}
                    fill="transparent"
                    onWheel={zoom.handleWheel}
                    onMouseDown={zoom.dragStart}
                    onMouseMove={zoom.dragMove}
                    onMouseUp={zoom.dragEnd}
                    onMouseLeave={() => {
                      if (!zoom.isDragging) return
                      zoom.dragEnd()
                    }}
                    onDoubleClick={event => {
                      const point = localPoint(event)
                      if (point) {
                        zoom.scale({ scaleX: 1.4, scaleY: 1.4, point })
                      }
                    }}
                  />
                  <g transform={zoom.toString()}>
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
                  </g>
                  {showMiniMap && (
                    <g
                      clipPath="url(#zoom-clip)"
                      transform={`
                      scale(0.25)
                      translate(${width * 4 - width - 60}, ${height * 4 -
                        height -
                        60})
                    `}
                    >
                      <rect width={width} height={height} fill="#1a1a1a" />
                      <rect
                        width={width}
                        height={height}
                        fill="white"
                        fillOpacity={0.2}
                        stroke="white"
                        strokeWidth={4}
                        transform={zoom.toStringInvert()}
                      />
                    </g>
                  )}
                </svg>
                {tooltipOpen && !!tooltipData && (
                  <TooltipWithBounds
                    key={Math.random()}
                    top={tooltipTop}
                    left={tooltipLeft}
                  >
                    <div>
                      <div>
                        <strong>{tooltipData.frontmatter.title}</strong>
                      </div>
                      <div>
                        Data: {formatDate(tooltipData.frontmatter.date)}
                      </div>
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
                <div className="controls">
                  <button
                    className="btn btn-zoom"
                    onClick={() => zoom.scale({ scaleX: 1.2, scaleY: 1.2 })}
                  >
                    +
                  </button>
                  <button
                    className="btn btn-zoom btn-bottom"
                    onClick={() => zoom.scale({ scaleX: 0.8, scaleY: 0.8 })}
                  >
                    -
                  </button>
                  <button className="btn btn-lg" onClick={zoom.center}>
                    Center
                  </button>
                  <button className="btn btn-lg" onClick={zoom.reset}>
                    Reset
                  </button>
                  <button className="btn btn-lg" onClick={zoom.clear}>
                    Clear
                  </button>
                </div>
                <div className="mini-map">
                  <button className="btn btn-lg" onClick={this.toggleMiniMap}>
                    {showMiniMap ? "Hide" : "Show"} Mini Map
                  </button>
                </div>
              </Group>
            )
          }}
        </Zoom>
        <div>
          <Legend
            scale={eventsOrdinalScale}
            direction="column-reverse"
            itemDirection="row-reverse"
            labelMargin="0 20px 0 0"
            shapeMargin="1px 0 0"
          />
        </div>
      </React.Fragment>
    )
  }
}

export default withTooltip(Network)
