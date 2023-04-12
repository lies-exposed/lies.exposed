// import { PieChartGraph } from "@components/Common/Graph/PieChartGraph";
// import { Events } from "@liexp/shared/lib/io/http";
// import ParentSize from "@visx/responsive/lib/components/ParentSize";
// import * as Array from "fp-ts/Array";
// import { eqString } from "fp-ts/Eq";
// import * as Map from "fp-ts/Map";
// import * as O from "fp-ts/Option";
// import { ordString } from "fp-ts/Ord";
// import * as Tuple from "fp-ts/Tuple";
// import { pipe } from "fp-ts/function";
// import React from "react";

// interface ProjectFundsPieGraphProps {
//   funds: Events.ProjectTransaction.ProjectTransaction[];
// }

// interface FundSlice {
//   amount: number;
//   label: string;
//   key: string;
// }

// export const ProjectFundsPieGraph: React.FC<ProjectFundsPieGraphProps> = (
//   props
// ) => {
//   const initData: Map<string, FundSlice> = Map.empty;
//   const data = pipe(
//     props.funds,
//     Array.reduce(initData, (acc, f) => {
//       const key = getUUIDForBy(f);
//       const label = getLabelForBy(f);

//       return pipe(
//         acc,
//         Map.lookup(eqString)(key),
//         O.getOrElse((): FundSlice => ({ amount: 0, label, key })),
//         (d) =>
//           Map.insertAt(eqString)(key, {
//             ...d,
//             amount: d.amount + f.transaction.amount,
//           })(acc)
//       );
//     }),
//     Map.toArray(ordString),
//     Array.map(Tuple.snd)
//   );

//   return (
//     <ParentSize style={{ width: "100%", height: 200 }}>
//       {({ width, height }) => (
//         <PieChartGraph<FundSlice>
//           width={width}
//           height={height}
//           slices={data}
//           getLabel={(f) => `${f.amount}`}
//           getKey={(f) => f.key}
//           getValue={(f) => f.amount}
//         />
//       )}
//     </ParentSize>
//   );
// };

// const getUUIDForBy = (
//   fund: Events.ProjectTransaction.ProjectTransaction
// ): string => {
//   switch (fund.transaction.by.type) {
//     case "Actor":
//       return fund.transaction.by.actor;
//     case "Group":
//       return fund.transaction.by.group;
//   }
// };

// const getLabelForBy = (
//   fund: Events.ProjectTransaction.ProjectTransaction
// ): string => {
//   switch (fund.transaction.by.type) {
//     case "Actor": {
//       return "TODO: actor fullName";
//       // return fund.transaction.by.actor.fullName;
//     }

//     case "Group": {
//       return "TODO: group name";
//       // return fund.transaction.by.group.name;
//     }
//   }
// };
export {};
