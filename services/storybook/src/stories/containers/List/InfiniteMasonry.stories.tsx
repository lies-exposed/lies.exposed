import { AutoSizer } from "@liexp/ui/lib/components/utils/AutoSizer.js";
import {
  InfiniteMasonry,
  type CellRendererProps,
} from "@liexp/ui/lib/containers/list/InfiniteListBox/InfiniteMasonry.js";
import { type Meta, type StoryObj } from "@storybook/react-vite";
import * as React from "react";

interface MockMasonryItem {
  id: string;
  title: string;
  height: number;
  color: string;
}

interface MasonryStoryProps {
  itemCount: number;
  columnCount?: number;
  containerHeight: number;
}

const colors = [
  "#d9ed92",
  "#b5e48c",
  "#99d98c",
  "#76c893",
  "#52b69a",
  "#34a0a4",
  "#168aad",
  "#1a759f",
  "#1e6091",
  "#184e77",
];

const createItems = (count: number): MockMasonryItem[] => {
  return Array.from({ length: count }, (_, index) => {
    const variance = 120 + ((index * 37) % 260);

    return {
      id: `mock-item-${index}`,
      title: `Card ${index + 1}`,
      height: variance,
      color: colors[index % colors.length],
    };
  });
};

const MasonryCell = React.forwardRef<HTMLDivElement, CellRendererProps>(
  ({ item, style, columnWidth, measure, index }, ref) => {
    const card = item as MockMasonryItem;
    const [expanded, setExpanded] = React.useState(false);

    React.useEffect(() => {
      measure();
    }, [expanded, measure]);

    return (
      <div
        ref={ref}
        style={{
          ...style,
          width: columnWidth,
          paddingBottom: 8,
          boxSizing: "border-box",
        }}
      >
        <article
          style={{
            height: expanded ? card.height + 120 : card.height,
            transition: "height 140ms ease",
            borderRadius: 10,
            background: card.color,
            color: "#0b1f2a",
            boxShadow: "0 8px 20px rgba(5, 20, 28, 0.15)",
            border: "1px solid rgba(8, 30, 41, 0.15)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ padding: 12 }}>
            <div style={{ fontSize: 12, opacity: 0.85 }}>#{index + 1}</div>
            <h3 style={{ margin: "6px 0 0", fontSize: 16 }}>{card.title}</h3>
          </div>
          <div style={{ padding: 12 }}>
            <button
              type="button"
              onClick={() => {
                setExpanded((current) => !current);
              }}
              style={{
                border: 0,
                borderRadius: 6,
                padding: "6px 10px",
                cursor: "pointer",
                background: "rgba(6, 17, 24, 0.8)",
                color: "#ecf8ff",
                fontSize: 12,
              }}
            >
              {expanded ? "Collapse" : "Expand"}
            </button>
          </div>
        </article>
      </div>
    );
  },
);

MasonryCell.displayName = "MasonryCell";

const MasonryPlayground: React.FC<MasonryStoryProps> = ({
  itemCount,
  columnCount,
  containerHeight,
}) => {
  const items = React.useMemo(() => createItems(itemCount), [itemCount]);

  return (
    <div
      style={{
        height: containerHeight,
        width: "100%",
        minHeight: 360,
        background:
          "linear-gradient(180deg, rgba(240, 247, 255, 1) 0%, rgba(224, 238, 250, 1) 100%)",
        border: "1px solid rgba(20, 50, 70, 0.12)",
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      <AutoSizer style={{ height: "100%", width: "100%" }}>
        {({ width, height }) => {
          return (
            <InfiniteMasonry
              width={width}
              height={height}
              items={items}
              columnCount={columnCount}
              getItem={(list, index) => list[index]}
              CellRenderer={MasonryCell}
            />
          );
        }}
      </AutoSizer>
    </div>
  );
};

const meta: Meta<typeof MasonryPlayground> = {
  title: "Containers/List/InfiniteMasonry",
  component: MasonryPlayground,
  parameters: {
    layout: "padded",
  },
  args: {
    itemCount: 400,
    columnCount: 4,
    containerHeight: 760,
  },
  argTypes: {
    itemCount: { control: { type: "range", min: 50, max: 1500, step: 50 } },
    columnCount: { control: { type: "number", min: 1, max: 8, step: 1 } },
    containerHeight: {
      control: { type: "range", min: 320, max: 1200, step: 20 },
    },
  },
};

export default meta;

type Story = StoryObj<typeof MasonryPlayground>;

export const VirtualizedMasonryPlayground: Story = {};
