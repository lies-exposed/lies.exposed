import { ParentSize } from "@visx/responsive";
import { scaleOrdinal } from "d3-scale";
import * as React from "react";
import { BubbleGraph } from "../../Common/Graph/BubbleGraph.js";
import { Legends } from "../../Common/Graph/Legends.js";
import { Typography } from "../../mui/index.js";
import data from "./wealth-distribution-data.json";

interface WealthDistributionDatum {
  label: string;
  // expressed in trillions of dollars
  wealth: number;
  // population expressed in millions
  number: number;
  color: string;
}

export type WealthDistributionGraphProps = any;

const wealthDistributionData: WealthDistributionDatum[] = data as any;

// const superRichWealth = 158.3 * 10e12;
// const superRichTotal = 47 * 10e6;
// // const superRich = superRichWealth / superRichTotal;
// const superRichCount = superRichTotal / 10e6;
// const superRichPopulationPercentage = 1;
// const superRichColor = "f32";

// const richWealth = 140.2 * 10e12;
// const richTotal = 499 * 10e6;
// // const rich = richWealth / richTotal;
// const richCount = richTotal / 10e7;
// const richPopulationPercentage = 9.8;
// const richColor = "b04";

// const middlWealth = 55.7 * 10e12;
// const middleTotal = 1661 * 10e6;
// // const middle = middlWealth / middleTotal;
// const middleCount = middleTotal / 10e6;
// const middlePopulationPercentage = 32.6;
// const middleColor = "a32";

// const poorWealth = 6.3 * 10e12;
// const poorTotal = 2883 * 10e6;
// // const poor = poorWealth / poorTotal;
// const poorCount = poorTotal / 10e6;
// const poorPopulationPercentage = 56.6;
// const poorColor = "11AA0F";

const { totalWealth, totalPeople } = wealthDistributionData.reduce(
  ({ totalPeople, totalWealth }, d) => ({
    totalPeople: totalPeople + d.number,
    totalWealth: totalWealth + d.wealth,
  }),
  { totalPeople: 0, totalWealth: 0 },
);

const getWealthPercentage = (share: number): number =>
  (share * 100) / totalWealth;

const getPeoplePercentage = (share: number): number =>
  (share * 100) / totalPeople;

export const WealthDistributionGraph: React.FC<
  WealthDistributionGraphProps
> = () => {
  const [toggle, setToggle] = React.useState(false);
  return (
    <>
      <Typography variant="h3">Global wealth distribution</Typography>
      <Typography>
        Pack size by {toggle ? "population percentage" : "wealth shares"}
      </Typography>
      <ParentSize style={{ height: 400 }}>
        {({ width, height }) => (
          <>
            <BubbleGraph
              variant="circle"
              width={width / 2}
              height={height}
              data={wealthDistributionData.reverse().map((d) => ({
                count: toggle ? d.number : getWealthPercentage(d.wealth),
                label: (toggle
                  ? getPeoplePercentage(d.number)
                  : getWealthPercentage(d.wealth)
                ).toFixed(2),
                color: d.color,
              }))}
              onClick={() => {
                setToggle(!toggle);
              }}
            />

            {/* <BubbleGraph
                width={width / 2}
                height={height}
                data={wealthDistributionData.reverse().map((d) => ({
                  count: toggle ? d.number : getWealthPercentage(d.wealth),
                  label: (toggle
                    ? getPeoplePercentage(d.number)
                    : getWealthPercentage(d.wealth)
                  ).toFixed(2),
                  color: d.color,
                }))}
                onClick={() => setToggle(!toggle)}
              /> */}
          </>
        )}
      </ParentSize>
      <Legends
        title="Population Percentage"
        scales={[
          {
            title: "Population Percentage",
            scale: scaleOrdinal(
              wealthDistributionData.map((d) => d.label),
              wealthDistributionData.map((d) => `${d.color}`),
            ),
            shape: "circle",
          },
        ]}
      />
    </>
  );
};
