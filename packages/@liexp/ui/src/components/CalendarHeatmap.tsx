import { ordEventDate } from "@liexp/shared/lib/helpers/event/event.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { Group } from "@visx/group";
import { HeatmapCircle } from "@visx/heatmap";
import { scaleLinear } from "@visx/scale";
import { withTooltip, Tooltip as TooltipWithBounds } from "@visx/tooltip";
import { type WithTooltipProvidedProps } from "@visx/tooltip/lib/enhancers/withTooltip.js";
import { addDays, differenceInDays } from "date-fns";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import { getDualOrd } from "fp-ts/lib/Ord.js";
import { identity, pipe } from "fp-ts/lib/function.js";
import * as React from "react";

const green = "#21f440";
const grey = "#404040";
const red = "#f33d15";

const bg = "#28272c";

// utils
const min = (data: any, f: (d: any) => number): number =>
  Math.min(...data.map(f));

interface TooltipData {
  event: O.Option<Events.Uncategorized.Uncategorized>;
  date: Date;
}

interface BinDatum extends TooltipData {
  bin: number;
  count: number;
  stroke: O.Option<string>;
}

interface CalendarHeatmapProps {
  width: number;
  height: number;
  separation?: number;
  margin?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  events: Events.Uncategorized.Uncategorized[];
  onCircleClick: (e: Events.Uncategorized.Uncategorized) => void;
}

const CalendarHeatmapComponent: React.FC<
  CalendarHeatmapProps & WithTooltipProvidedProps<TooltipData>
> = ({
  width,
  height,
  separation = 5,
  margin = {
    top: 10,
    left: 10,
    right: 20,
    bottom: 60,
  },
  events,
  onCircleClick,
  tooltipData,
  tooltipOpen,
  showTooltip,
  tooltipTop,
  tooltipLeft,
}) => {
  // bounds
  let size = width;
  if (size > margin.left + margin.right) {
    size = width - margin.left - margin.right - separation;
  }

  const xMax = size;
  const yMax = height - margin.bottom - margin.top;

  const eventsSortedByDate = A.sortBy([getDualOrd(ordEventDate)])(events);
  const firstEvent = A.last(eventsSortedByDate);
  const lastEvent = A.head(eventsSortedByDate);

  return pipe(
    sequenceS(O.option)({
      events: O.some(events),
      firstEvent,
      lastEvent,
    }),
    O.fold(
      () => null,
      ({ events, firstEvent, lastEvent }) => {
        const bucketSizeMax = 52; // week in year
        const firstEventDate = firstEvent.date;
        const eventsWithDiff = events.map((e) => ({
          ...e,
          days: differenceInDays(e.date, firstEvent.date),
        }));

        const weekBins = (_week: number): BinDatum[] => {
          const week = _week > 0 ? _week * 7 : _week;
          return A.range(0, 6).map((n) => {
            const currentDay = n + week;
            const currentDate = addDays(firstEventDate, currentDay);
            const result = pipe(
              eventsWithDiff,
              A.findFirst((e) => e.days === currentDay),
              O.fold(
                () => ({
                  bin: n,
                  count: 5,
                  event: O.none,
                  date: currentDate,
                  stroke: O.none,
                }),
                (e) => {
                  return {
                    bin: n,
                    count: 0,
                    event: O.some(e),
                    date: e.date,
                    stroke: O.some("#c33bff"),
                  };
                },
              ),
            );
            return result;
          });
        };

        const data = A.range(0, bucketSizeMax - 1).map((n) => ({
          bin: n,
          bins: weekBins(n),
        }));

        // colors
        const colorMax = 10;

        // scales
        const xScale = scaleLinear<number>({
          domain: [0, bucketSizeMax],
        });
        const yScale = scaleLinear<number>({
          domain: [0, 7],
        });
        const circleColorScale = scaleLinear({
          range: [green, grey, red],
          domain: [0, 5, colorMax],
        });

        // const opacityScale = scaleLinear({
        //   range: [0.1, 1],
        //   domain: [0, colorMax],
        // })

        const binWidth = xMax / data.length;
        const binHeight = yMax / 7;
        const radius = min([binWidth, binHeight], identity) / 2;

        xScale.range([0, xMax]);
        yScale.range([yMax, 0]);

        return (
          <React.Fragment>
            <svg width={width} height={height}>
              <rect x={0} y={0} width={width} height={height} fill={bg} />
              <Group top={margin.top} left={margin.left}>
                <HeatmapCircle<(typeof data)[0], BinDatum>
                  data={data}
                  xScale={(n) => xScale(n) ?? 0}
                  yScale={(n) => yScale(n) ?? 0}
                  colorScale={circleColorScale}
                  radius={radius}
                  gap={1}
                >
                  {(heatmap) => {
                    return heatmap.map((bins) => {
                      return bins.map((bin) => {
                        const row = bin.row.toString();
                        const column = bin.column.toString();
                        return (
                          <circle
                            key={`heatmap-circle-${row}-${column}`}
                            className="vx-heatmap-circle"
                            cx={bin.cx}
                            cy={bin.cy}
                            r={bin.r}
                            fill={`#${bin.color}`}
                            fillOpacity={bin.opacity}
                            stroke={O.toUndefined(bin.bin.stroke)}
                            strokeWidth="2"
                            onClick={(event) => {
                              if (O.isSome(bin.bin.event)) {
                                onCircleClick(bin.bin.event.value);
                              }
                            }}
                            onMouseOver={() => {
                              if (showTooltip !== undefined) {
                                showTooltip({
                                  tooltipLeft: bin.cx,
                                  tooltipTop: bin.cy,
                                  tooltipData: bin.bin as TooltipData,
                                });
                              }
                            }}
                            style={{
                              cursor: "pointer",
                            }}
                          />
                        );
                      });
                    });
                  }}
                </HeatmapCircle>
              </Group>
            </svg>
            {tooltipOpen && tooltipData !== undefined ? (
              <TooltipWithBounds
                key={Math.random()}
                top={tooltipTop}
                left={tooltipLeft}
                style={{ maxWidth: 200 }}
              >
                <p>{formatDate(tooltipData.date)}</p>

                {pipe(
                  tooltipData.event,
                  O.fold(
                    () => null,
                    (e) => {
                      return <p>{e.payload.title}</p>;
                    },
                  ),
                )}
              </TooltipWithBounds>
            ) : null}
          </React.Fragment>
        );
      },
    ),
  );
};

export const CalendarHeatmap = withTooltip<CalendarHeatmapProps, TooltipData>(
  CalendarHeatmapComponent,
);
