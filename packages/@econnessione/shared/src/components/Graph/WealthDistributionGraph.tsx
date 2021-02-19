import { BubbleGraph } from "@components/Common/Graph/BubbleGraph";
import { Legends } from "@components/Common/Graph/Legends";
import ParentSize from "@vx/responsive/lib/components/ParentSize";
import { scaleOrdinal } from "d3";
import * as React from "react";

export type WealthDistributionGraphProps = never;

const superRichWealth = 158.3 * 10e12;
const superRichTotal = 47 * 10e6;
// const superRich = superRichWealth / superRichTotal;
const superRichCount = superRichTotal / 10e6;
const superRichPopulationPercentage = 1;
const superRichColor = "f32";

const richWealth = 140.2 * 10e12;
const richTotal = 499 * 10e6;
// const rich = richWealth / richTotal;
const richCount = richTotal / 10e7;
const richPopulationPercentage = 9.8;
const richColor = "b04";

const middlWealth = 55.7 * 10e12;
const middleTotal = 1661 * 10e6;
// const middle = middlWealth / middleTotal;
const middleCount = middleTotal / 10e6;
const middlePopulationPercentage = 32.6;
const middleColor = "a32";

const poorWealth = 6.3 * 10e12;
const poorTotal = 2883 * 10e6;
// const poor = poorWealth / poorTotal;
const poorCount = poorTotal / 10e6;
const poorPopulationPercentage = 56.6;
const poorColor = "11AA0F";

// const totalWealth = superRichWealth + richWealth + middlWealth + poorWealth;

// const getWealthPercentage = (share: number): number => (share * 100) / totalWealth;

// const superRichWealthPercentage = getWealthPercentage(superRichWealth)
// const richWealthPercentage = getWealthPercentage(richWealth)
// const middlWealthPercentage = getWealthPercentage(middlWealth)
// const poorWealthPercentage = getWealthPercentage(poorWealth);

// const superRichData = A.range(0, superRichCount).map(() => ({
//   label: superRichPercentage,
//   count: superRich,
//   color: superRichColor,
// }));

// const richData = A.range(0, richCount).map(() => ({
//   label: richPercentage,
//   count: rich,
//   color: richColor,
// }));

// const middleData = A.range(0, middleCount).map(() => ({
//   label: middlePercentage,
//   count: middle,
//   color: middleColor,
// }));

// const poorData = A.range(0, poorCount).map(() => ({
//   label: poorPercentage,
//   count: poor,
//   color: poorColor,
// }));

// const _data = [...superRichData, ...richData, ...middleData, ...poorData];

export const WealthDistributionGraph: React.FC<WealthDistributionGraphProps> = (
  props
) => {
  return (
    <>
      {"Global Wealth distribution:"}
      <br />
      <label>
        Super rich people: {superRichCount}m {}
      </label>
      <br />
      <label>Rich people: {richCount}m</label>
      <br />
      <label>Middle people: {middleCount}m</label>
      <br />
      <label>Poor people: {poorCount}m</label>
      <ParentSize style={{ height: 400 }}>
        {({ width, height }) => (
          <>
            <BubbleGraph
              width={width / 2}
              height={height}
              data={[
                {
                  count: superRichWealth,
                  label: `${superRichPopulationPercentage}%`,
                  color: superRichColor,
                },
                {
                  count: richWealth,
                  label: `${richPopulationPercentage}%`,
                  color: richColor,
                },
                {
                  count: middlWealth,
                  label: `${middlePopulationPercentage}%`,
                  color: middleColor,
                },
                {
                  count: poorWealth,
                  label: `${poorPopulationPercentage}%`,
                  color: poorColor,
                },
              ]}
            />
            <BubbleGraph
              width={width / 2}
              height={height}
              data={[
                {
                  count: superRichPopulationPercentage,
                  label: `${superRichPopulationPercentage}%`,
                  color: superRichColor,
                },
                {
                  count: richPopulationPercentage,
                  label: `${richPopulationPercentage}%`,
                  color: richColor,
                },
                {
                  count: middlePopulationPercentage,
                  label: `${middlePopulationPercentage}%`,
                  color: middleColor,
                },
                {
                  count: poorPopulationPercentage,
                  label: `${poorPopulationPercentage}%`,
                  color: poorColor,
                },
              ]}
            />
          </>
        )}
      </ParentSize>
      <Legends
        title="Population Percentage"
        scales={[
          {
            title: "Population Percentage",
            scale: scaleOrdinal(
              [
                superRichPopulationPercentage,
                richPopulationPercentage,
                middlePopulationPercentage,
                poorPopulationPercentage,
              ].map(n => n.toString()),
              [superRichColor, richColor, middleColor, poorColor]
            ),
            shape: "circle",
          },
        ]}
      />
    </>
  );
};
