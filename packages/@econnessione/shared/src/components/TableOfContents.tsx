import uuid from "@utils/uuid";
import { Block } from "baseui/block";
import {
  StatefulTreeView,
  TreeLabel,
  TreeLabelProps,
  TreeNode,
} from "baseui/tree-view";
import {
  HeadingXSmall,
  LabelLarge,
  LabelMedium,
  LabelSmall,
} from "baseui/typography";
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

interface TOCNode extends Omit<TreeNode, "info"> {
  info: { depth: number };
}

const CustomLabel = (node: TreeNode): JSX.Element => {
  const Tag = ((depth) => {
    switch (depth) {
      case 1:
        return LabelLarge;
      case 2:
        return LabelMedium;
      case 3:
      default:
        return LabelSmall;
    }
  })((node as TOCNode).info.depth);

  return <Tag>{node.label}</Tag>;
};

const CustomTreeLabel = (props: TreeLabelProps): JSX.Element => {
  return <TreeLabel {...props} label={CustomLabel} />;
};

export const TableOfContents: React.FC<Items> = ({ items }) => {
  return pipe(
    O.fromNullable(items),
    O.map((items) => traverseItem(items, 1)),
    O.map((data) => (
      // eslint-disable-next-line react/jsx-key
      <Block overrides={{ Block: { style: { padding: "20px" } } }}>
        <HeadingXSmall>Tabella dei contenuti</HeadingXSmall>
        <StatefulTreeView
          data={data}
          overrides={{
            TreeLabel: {
              component: CustomTreeLabel,
            },
          }}
        />
      </Block>
    )),
    O.toNullable
  );
};

const traverseItem = (
  items: Item[],
  depth: number
): Array<TreeNode<{ depth: number }>> => {
  return items.map((i) => ({
    id: i.url ?? uuid(),
    info: { depth },
    label: i.title ?? "",
    isExpanded: true,
    children: i.items !== undefined ? traverseItem(i.items, depth + 1) : [],
  }));
};
