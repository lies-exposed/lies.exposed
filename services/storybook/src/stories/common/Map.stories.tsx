import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import Map, { type MapProps } from "@liexp/ui/lib/components/Map.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { type StoryObj, type Meta } from "@storybook/react-vite";
import { ParentSize } from "@visx/responsive";
import * as React from "react";

const meta = {
  title: "Components/Map",
  component: Map,
  render: (props) => {
    return (
      <QueriesRenderer
        queries={{}}
        render={() => {
          return (
            <MainContent style={{ height: "100%" }}>
              <ParentSize
                style={{ minHeight: props.height, maxHeight: "100%" }}
              >
                {({ width, height }) => (
                  <Map {...props} width={width} height={height} />
                )}
              </ParentSize>
            </MainContent>
          );
        }}
      />
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as Meta<MapProps<any>>;

export default meta;

type Story = StoryObj<typeof meta>;

export const MapExample = {
  args: {
    width: 500,
    height: 300,
    features: [],
    center: [0, 0],
    zoom: 1,
  },
} satisfies Story;
