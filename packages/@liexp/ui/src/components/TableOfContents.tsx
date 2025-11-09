import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { Typography } from "./mui/index.js";

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

// const CustomLabel = (node: TreeNode): React.ReactElement => {
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

// const CustomTreeLabel = (props: TreeLabelProps): React.ReactElement => {
//   return <TreeLabel {...props} label={CustomLabel} />;
// };

export const TableOfContents: React.FC<Items> = ({ items }) => {
  return pipe(
    O.fromNullable(items),
    O.map((items) => traverseItem(items, 1)),
    O.map((_data) => (
      <div>
        <Typography variant="h3">Tabella dei contenuti</Typography>
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
    O.toNullable,
  );
};

const traverseItem = (
  items: Item[],
  depth: number,
): {
  id: string;
  info: { depth: number };
  label: string;
  isExpanded: boolean;
  children: unknown[];
}[] => {
  return items.map((i) => ({
    id: i.url ?? uuid(),
    info: { depth },
    label: i.title ?? "",
    isExpanded: true,
    children: i.items !== undefined ? traverseItem(i.items, depth + 1) : [],
  }));
};
