import uuid from "@utils/uuid";
// import {
//   StatefulTreeView,
//   TreeLabel,
//   TreeLabelProps,
//   TreeNode
// } from "baseui/tree-view";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";

interface Item {
  url?: string;
  title?: string;
  items?: Item[];
}
interface Items {
  items?: Item[];
}

// interface TOCNode extends Omit<TreeNode, "info"> {
//   info: { depth: number };
// }

// const CustomLabel = (node: TreeNode): JSX.Element => {
//   const Tag = ((depth) => {
//     switch (depth) {
//       case 1:
//         return FormLabel;
//       case 2:
//         return FormLabel;
//       case 3:
//       default:
//         return FormLabel;
//     }
//   })((node as TOCNode).info.depth);

//   return <Tag>{node.label}</Tag>;
// };

// const CustomTreeLabel = (props: TreeLabelProps): JSX.Element => {
//   return <TreeLabel {...props} label={CustomLabel} />;
// };

export const TableOfContents: React.FC<Items> = ({ items }) => {
  return pipe(
    O.fromNullable(items),
    O.map((items) => traverseItem(items, 1)),
    O.map((data) => (
      // eslint-disable-next-line react/jsx-key
      <div>
        <h1>Tabella dei contenuti</h1>
        {/* <StatefulTreeView
          data={data}
          overrides={{
            TreeLabel: {
              component: CustomTreeLabel,
            },
          }}
        /> */}
      </div>
    )),
    O.toNullable
  );
};

const traverseItem = (
  items: Item[],
  depth: number
): any[] => {
  return items.map((i) => ({
    id: i.url ?? uuid(),
    info: { depth },
    label: i.title ?? "",
    isExpanded: true,
    children: i.items !== undefined ? traverseItem(i.items, depth + 1) : [],
  }));
};
