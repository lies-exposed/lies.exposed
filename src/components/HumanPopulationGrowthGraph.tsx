import * as React from "react"
import { Axis } from "./graph/Axis"

const data = [
  {
    year: -1000,
    population: 50,
  },
  {
    year: -500,
    population: 100
  },
  {
    year: 1,
    population: 200
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
    year: 2015,
    population: 7349
  }
]

export const HumanPopulationGrowthGraph: React.FC = () => {
  return (
    <Axis
      width={1000}
      height={600}
      margin={{ top: 100, right: 100, bottom: 100, left: 100 }}
      data={data}
      getX={(d) => d.year}
      getY={d => d.population}
    />
  )
}
