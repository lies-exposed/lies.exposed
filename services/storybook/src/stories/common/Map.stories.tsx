import { MainContent } from "@liexp/ui/lib/components/MainContent";
import Map, { type MapProps } from "@liexp/ui/lib/components/Map";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import { useActorsQuery } from "@liexp/ui/lib/state/queries/actor.queries";
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
      queries={{ actors: useActorsQuery({}, false) }}
      render={({ actors }) => {
        const actor = actors.data[0];
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
