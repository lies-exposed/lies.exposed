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
  layoutMode: 'stable' | 'optimal';
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

    // Call measure when expanded state changes to ensure layout updates
    React.useLayoutEffect(() => {
      // Small delay to ensure the DOM has updated with new height
      const timeoutId = window.setTimeout(() => {
        measure();
      }, 150); // Wait for CSS transition to complete

      return () => clearTimeout(timeoutId);
    }, [expanded, measure]);

    const toggleExpanded = React.useCallback(() => {
      setExpanded((current) => !current);
    }, []);

    // Calculate column for visual indicator
    const column = index % 4; // Assuming 4 columns for demo
    const columnColors = ['🔵', '🟢', '🟡', '🟣'];

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
            boxShadow: expanded 
              ? "0 12px 24px rgba(5, 20, 28, 0.25)" 
              : "0 8px 20px rgba(5, 20, 28, 0.15)",
            border: expanded
              ? "2px solid rgba(8, 30, 41, 0.3)"
              : "1px solid rgba(8, 30, 41, 0.15)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            transform: expanded ? "scale(1.02)" : "scale(1)",
          }}
        >
          <div style={{ padding: 12 }}>
            <div style={{ 
              fontSize: 12, 
              opacity: 0.85,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>#{index + 1}</span>
              <span title={`Column ${column + 1}`}>{columnColors[column]}</span>
            </div>
            <h3 style={{ margin: "6px 0 0", fontSize: 16 }}>{card.title}</h3>
            {expanded && (
              <div style={{ marginTop: 12, fontSize: 13, opacity: 0.9 }}>
                <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>
                  🎯 Notice: Cards below should move DOWN, not sideways!
                </p>
                <p style={{ margin: '0 0 8px 0' }}>
                  This expanded content demonstrates the stable layout behavior where cards maintain their column assignments.
                </p>
                <p style={{ margin: '0', fontSize: 12, opacity: 0.7 }}>
                  Column indicator: {columnColors[column]} (Column {column + 1})
                </p>
              </div>
            )}
          </div>
          <div style={{ padding: 12 }}>
            <button
              type="button"
              onClick={toggleExpanded}
              style={{
                border: 0,
                borderRadius: 6,
                padding: "8px 12px",
                cursor: "pointer",
                background: expanded 
                  ? "rgba(220, 38, 38, 0.8)" 
                  : "rgba(6, 17, 24, 0.8)",
                color: "#ecf8ff",
                fontSize: 12,
                fontWeight: expanded ? "bold" : "normal",
                transition: "all 140ms ease",
              }}
            >
              {expanded ? "🔽 Collapse" : "🔼 Expand"}
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
  layoutMode,
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
      <div
        style={{
          padding: "8px 12px",
          fontSize: "12px",
          fontWeight: "bold",
          color: "#0b1f2a",
          backgroundColor: "rgba(255, 255, 255, 0.8)",
          borderBottom: "1px solid rgba(20, 50, 70, 0.12)",
        }}
      >
        Layout Mode: {layoutMode === 'stable' ? 'Stable (cards stay in columns)' : 'Optimal (cards can move between columns)'}
      </div>
      <AutoSizer style={{ height: "calc(100% - 32px)", width: "100%" }}>
        {({ width, height }) => {
          return (
            <InfiniteMasonry
              width={width}
              height={height}
              items={items}
              columnCount={columnCount}
              layoutMode={layoutMode}
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
    layoutMode: 'stable' as const,
  },
  argTypes: {
    itemCount: { control: { type: "range", min: 50, max: 1500, step: 50 } },
    columnCount: { control: { type: "number", min: 1, max: 8, step: 1 } },
    containerHeight: {
      control: { type: "range", min: 320, max: 1200, step: 20 },
    },
    layoutMode: {
      control: { type: "select" },
      options: ['stable', 'optimal'],
      description: "Layout behavior: 'stable' keeps cards in columns (better UX), 'optimal' allows column switching (better space usage)",
    },
  },
};

export default meta;

type Story = StoryObj<typeof MasonryPlayground>;

export const VirtualizedMasonryPlayground: Story = {};
