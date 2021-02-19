import { GradientPinkBlue } from "@vx/gradient";
import { Group } from "@vx/group";
import { scaleOrdinal } from "@vx/scale";
import Pie, { PieArcDatum, ProvidedProps } from "@vx/shape/lib/shapes/Pie";
import React, { useState } from "react";
import { animated, interpolate, useTransition } from "react-spring";

// color scales
const defaultMargin = { top: 20, right: 20, bottom: 20, left: 20 };

export interface PieProps<S> {
  width: number;
  height: number;
  slices: S[];
  getValue: (slice: S) => number;
  getKey: (slice: S) => string;
  getLabel: (slice: S) => string;
  margin?: typeof defaultMargin;
  animate?: boolean;
}

export const PieChartGraph = <S extends any>({
  width,
  height,
  slices,
  getLabel,
  getKey,
  getValue,
  margin = defaultMargin,
  animate = true,
}: PieProps<S>): JSX.Element | null => {
  const [selectedSlice, setSelectedSlice] = useState<string | null>(null);

  const getSliceColor = scaleOrdinal({
    domain: slices.map(getKey),
    range: [
      "rgba(93,30,91,1)",
      "rgba(93,30,91,0.8)",
      "rgba(93,30,91,0.6)",
      "rgba(93,30,91,0.4)",
    ],
  });

  if (width < 10) return null;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const radius = Math.min(innerWidth, innerHeight) / 2;
  const centerY = innerHeight / 2;
  const centerX = innerWidth / 2;

  return (
    <svg width={width} height={height}>
      <GradientPinkBlue id="vx-pie-gradient" />
      <rect width={width} height={height} fill="url('#vx-pie-gradient')" />
      <Group top={centerY + margin.top} left={centerX + margin.left}>
        <Pie
          data={
            selectedSlice !== null
              ? slices.filter((d) => getKey(d) === selectedSlice)
              : slices
          }
          pieValue={getValue}
          outerRadius={radius}
          innerRadius={0}
          cornerRadius={3}
          padAngle={0.005}
        >
          {(pie) => (
            <AnimatedPie<S>
              {...pie}
              animate={animate}
              getKey={(arc) => getKey(arc.data)}
              getLabel={(arc) => getLabel(arc.data)}
              onClickDatum={({ data }) =>
                animate &&
                setSelectedSlice(
                  selectedSlice !== null && selectedSlice === getKey(data)
                    ? null
                    : getKey(data)
                )
              }
              getColor={(arc) => getSliceColor(getKey(arc.data))}
            />
          )}
        </Pie>
      </Group>
      {animate && (
        <text
          textAnchor="end"
          x={width - 16}
          y={height - 16}
          fill="white"
          fontSize={11}
          fontWeight={300}
          pointerEvents="none"
        >
          Click segments to update
        </text>
      )}
    </svg>
  );
};

// react-spring transition definitions
interface AnimatedStyles {
  startAngle: number;
  endAngle: number;
  opacity: number;
}

const fromLeaveTransition = ({
  endAngle,
}: PieArcDatum<any>): AnimatedStyles => ({
  // enter from 360° if end angle is > 180°
  startAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  endAngle: endAngle > Math.PI ? 2 * Math.PI : 0,
  opacity: 0,
});
const enterUpdateTransition = ({
  startAngle,
  endAngle,
}: PieArcDatum<any>): AnimatedStyles => ({
  startAngle,
  endAngle,
  opacity: 1,
});

type AnimatedPieProps<Datum> = ProvidedProps<Datum> & {
  animate?: boolean;
  getKey: (d: PieArcDatum<Datum>) => string;
  getLabel: (d: PieArcDatum<Datum>) => string;
  getColor: (d: PieArcDatum<Datum>) => string;
  onClickDatum: (d: PieArcDatum<Datum>) => void;
  delay?: number;
};

function AnimatedPie<Datum>({
  animate,
  arcs,
  path,
  getKey,
  getLabel,
  getColor,
  onClickDatum,
}: AnimatedPieProps<Datum>): JSX.Element {
  const transitions = useTransition<PieArcDatum<Datum>, AnimatedStyles>(
    arcs,
    getKey,
    {
      from: animate !== null ? fromLeaveTransition : enterUpdateTransition,
      enter: enterUpdateTransition,
      update: enterUpdateTransition,
      leave: animate !== null ? fromLeaveTransition : enterUpdateTransition,
    } as any
  );
  return (
    <>
      {transitions.map(
        ({
          item: arc,
          props,
          key,
        }: {
          item: PieArcDatum<Datum>;
          props: AnimatedStyles;
          key: string;
        }) => {
          const [centroidX, centroidY] = path.centroid(arc);
          const hasSpaceForLabel = arc.endAngle - arc.startAngle >= 0.1;

          return (
            <g key={key}>
              <animated.path
                // compute interpolated path d attribute from intermediate angle values
                d={interpolate(
                  [props.startAngle, props.endAngle],
                  (startAngle, endAngle) =>
                    path({
                      ...arc,
                      startAngle,
                      endAngle,
                    })
                )}
                fill={getColor(arc)}
                onClick={() => onClickDatum(arc)}
                onTouchStart={() => onClickDatum(arc)}
              />
              {hasSpaceForLabel && (
                <animated.g style={{ opacity: props.opacity }}>
                  <text
                    fill="white"
                    x={centroidX}
                    y={centroidY}
                    dy=".33em"
                    fontSize={9}
                    textAnchor="middle"
                    pointerEvents="none"
                  >
                    {getLabel(arc)}
                  </text>
                </animated.g>
              )}
            </g>
          );
        }
      )}
    </>
  );
}
