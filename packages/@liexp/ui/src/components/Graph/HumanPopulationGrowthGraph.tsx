import { LinearGradient } from "@visx/gradient";
import { ParentSize } from "@visx/responsive";
import * as React from "react";
import { AxisGraph } from "../Common/Graph/AxisGraph.js";

export interface HumanPopulationGrowthGraphProps {
  showPoints: boolean;
}

const data = [
  {
    year: -1000,
    population: 50,
  },
  {
    year: -500,
    population: 100,
  },
  {
    year: 1,
    population: 200,
  },
  {
    year: 1000,
    population: 400,
  },
  {
    year: 1500,
    population: 458,
  },
  {
    year: 1600,
    population: 580,
  },
  {
    year: 1700,
    population: 682,
  },
  {
    year: 1750,
    population: 791,
  },
  {
    year: 1800,
    population: 1000,
  },
  {
    year: 1850,
    population: 1262,
  },
  {
    year: 1900,
    population: 1650,
  },
  {
    year: 1950,
    population: 2525,
  },
  {
    year: 1955,
    population: 2758,
  },
  {
    year: 1960,
    population: 3018,
  },
  {
    year: 1965,
    population: 3322,
  },
  {
    year: 1970,
    population: 3682,
  },
  {
    year: 1975,
    population: 4061,
  },
  {
    year: 1980,
    population: 4440,
  },
  {
    year: 1985,
    population: 4853,
  },
  { year: 1990, population: 5310 },
  { year: 1995, population: 5735 },
  { year: 2000, population: 6127 },
  { year: 2005, population: 6520 },
  { year: 2010, population: 6930 },
  { year: 2015, population: 7349 },
];

const pointsData = [
  {
    year: 1804,
    population: 1000,
  },
  {
    year: 1927,
    population: 2000,
  },
  {
    year: 1960,
    population: 3000,
  },
  { year: 1974, population: 4000 },
  { year: 1987, population: 5000 },
  { year: 1999, population: 6000 },
  { year: 2011, population: 7000 },
];

export const HumanPopulationGrowthGraph: React.FC<
  HumanPopulationGrowthGraphProps
> = ({ showPoints }) => {
  const filteredData = data;
  // .filter(d => d.year > 1800 && d.year < 2020)

  return (
    <ParentSize style={{ height: 400, width: "100%" }}>
      {({ width, height }) => (
        <AxisGraph
          id="human-population-growth"
          width={width}
          height={height}
          margin={{ top: 60, right: 60, bottom: 60, left: 60 }}
          linePathElement={(id) => (
            <LinearGradient
              id={id}
              vertical={true}
              to={"#23cbd4"}
              from={"#d42626"}
              fromOpacity={1}
              fromOffset={"60%"}
              toOpacity={0.5}
            />
          )}
          background={(id) => (
            <LinearGradient
              id={id}
              to={"#ffc096"}
              from={"#d42323"}
              vertical={true}
              rotate={0}
              fromOpacity={0.5}
              toOpacity={1}
            />
          )}
          data={filteredData}
          points={showPoints ? { data: pointsData } : undefined}
          getX={(d) => d.year}
          getY={(d) => d.population}
          showPoints={showPoints}
          showGrid={true}
          axisLeftLabel={"Millions of people"}
          axisRightLabel={"Millions of people"}
          axisBottomLabel={"Year"}
        />
      )}
    </ParentSize>
  );
};
