import * as React from "react";
import { Counter } from "./Counter.js";

const populationOnFirstJanuary = 7794798739; // value on 1 January 2020
const firstJanuaryDate = new Date("2020/01/01");
const yearlyGrowPercentage = 0.98;
const deltaValue = (populationOnFirstJanuary * yearlyGrowPercentage) / 100;

const calculatePopulation = (): number => {
  const yearTime = Date.now() - firstJanuaryDate.getTime();
  const populationIncrement = deltaValue * (yearTime / (365 * 86400 * 1000));
  const actualPop = populationOnFirstJanuary + populationIncrement;

  return parseInt(actualPop.toString(), 10);
};

export const WorldPopulationCounter: React.FC = (_props) => {
  return (
    <Counter
      message="World population"
      getCount={calculatePopulation}
      sources={[
        {
          label: "World Population Prospect 2019",
          url: "https://population.un.org/wpp/",
        },
      ]}
    />
  );
};
