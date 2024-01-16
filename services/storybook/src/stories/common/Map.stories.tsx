import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import Map, { type MapProps } from "@liexp/ui/lib/components/Map.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Map",
  component: Map,
};

export default meta;

const Template: StoryFn<MapProps<any>> = (props) => {
  return (
    <QueriesRenderer
      queries={{}}
      render={() => {
        return (
          <MainContent>
            <Map {...props} />
          </MainContent>
        );
      }}
    />
  );
};

const MapExample = Template.bind({});

MapExample.args = {
  width: 500,
  height: 300,
  features: [],
  center: [0, 0],
  zoom: 1,
};

export { MapExample };
