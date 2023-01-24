import { MainContent } from "@liexp/ui/components/MainContent";
import Map, { type MapProps } from "@liexp/ui/components/Map";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import { useActorsQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { type Meta, type Story } from "@storybook/react/types-6-0";
import * as React from "react";

const meta: Meta = {
  title: "Components/Map",
  component: Map,
};

export default meta;

const Template: Story<MapProps<any>> = (props) => {
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
