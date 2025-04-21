import { LinearGradient } from "@visx/gradient";
import { Group } from "@visx/group";
import { Tree as VXTree } from "@visx/hierarchy";
import { LinkHorizontal } from "@visx/shape";
import { hierarchy, type HierarchyPointNode } from "d3-hierarchy";
import { Schema } from "effect";
import * as React from "react";

class TreeEvent extends Schema.Class<TreeEvent>("TreeEvent")({
  name: Schema.String,
  date: Schema.ValidDateFromSelf,
  children: Schema.Array(
    Schema.suspend((): Schema.Schema<TreeEvent> => TreeEvent),
  ),
}) {}

const peach = "#fd9b93";
const pink = "#fe6e9e";
const blue = "#03c0dc";
const green = "#26deb0";
const lightpurple = "#374469";
const white = "#ffffff";
const bg = "#272b4d";

function Node({
  node,
}: {
  node: HierarchyPointNode<TreeEvent>;
}): React.ReactElement {
  const width = 40;
  const height = 20;
  const centerX = -width / 2;
  const centerY = -height / 2;
  const isRoot = node.depth === 0;
  const isParent = node.children !== undefined;

  if (isRoot) return <Node node={node} />;
  if (isParent) return <ParentNode node={node} />;

  return (
    <Group top={node.x} left={node.y}>
      <rect
        height={height}
        width={width}
        y={centerY}
        x={centerX}
        fill={bg}
        stroke={green}
        strokeWidth={1}
        strokeDasharray={"2,2"}
        strokeOpacity={0.6}
        rx={10}
        onClick={() => {
          alert(`clicked: ${JSON.stringify(node.data.name)}`);
        }}
      />
      <text
        dy={".33em"}
        fontSize={9}
        fontFamily="Arial"
        textAnchor={"middle"}
        fill={green}
        style={{ pointerEvents: "none" }}
      >
        {node.data.name}
      </text>
    </Group>
  );
}

function ParentNode({
  node,
}: {
  node: HierarchyPointNode<TreeEvent>;
}): React.ReactElement {
  const width = 40;
  const height = 20;
  const centerX = -width / 2;
  const centerY = -height / 2;

  return (
    <Group top={node.x} left={node.y}>
      <rect
        height={height}
        width={width}
        y={centerY}
        x={centerX}
        fill={bg}
        stroke={blue}
        strokeWidth={1}
        onClick={() => {
          alert(`clicked: ${JSON.stringify(node.data.name)}`);
        }}
      />
      <text
        dy={".33em"}
        fontSize={9}
        fontFamily="Arial"
        textAnchor={"middle"}
        style={{ pointerEvents: "none" }}
        fill={white}
      >
        {node.data.name}
      </text>
    </Group>
  );
}

const TreeProps = Schema.Struct({
  events: Schema.Array(TreeEvent),
  width: Schema.Number,
  height: Schema.Number,
  margin: Schema.Struct({
    top: Schema.Number,
    left: Schema.Number,
    right: Schema.Number,
    bottom: Schema.Number,
  }),
});

type TreeProps = typeof TreeProps.Type;

const Tree: React.FC<TreeProps> = ({ width, height, margin, events }) => {
  const data = hierarchy(events);

  const yMax = height - margin.top - margin.bottom;
  const xMax = width - margin.left - margin.right;

  return (
    <svg width={width} height={height}>
      <LinearGradient id="lg" from={peach} to={pink} />
      <rect width={width} height={height} rx={14} fill={bg} />
      <VXTree root={data} size={[yMax, xMax]}>
        {(tree) => {
          return (
            <Group top={margin.top} left={margin.left}>
              {tree.links().map((link, i) => {
                return (
                  <LinkHorizontal
                    key={`link-${i.toString()}`}
                    data={link}
                    stroke={lightpurple}
                    strokeWidth="1"
                    fill="none"
                  />
                );
              })}
              {(
                tree.descendants() as any as HierarchyPointNode<TreeEvent>[]
              ).map((node: HierarchyPointNode<TreeEvent>, i) => {
                return <Node key={`node-${i.toString()}`} node={node} />;
              })}
            </Group>
          );
        }}
      </VXTree>
    </svg>
  );
};

export default Tree;
