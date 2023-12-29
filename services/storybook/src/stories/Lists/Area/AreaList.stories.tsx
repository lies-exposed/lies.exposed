import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import {
  AreaList,
  type AreaListProps,
} from "@liexp/ui/lib/components/lists/AreaList";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Components/Lists/Area/AreaList",
  component: AreaList,
};

export default meta;

const Template: StoryFn<AreaListProps> = (props) => {

  return (
    <div style={{ height: "100%" }}>
      <QueriesRenderer
        queries={(Q) => ({
          areas: Q.Area.list.useQuery(
            {
              filter: null,
              pagination: {
                perPage: 20,
                page: 1,
              },
            },
            undefined,
            false,
          ),
        })}
        render={({ areas: { data } }) => {
          return (
            <AreaList
              {...props}
              areas={data.map((s) => ({ ...s, selected: true }))}
            />
          );
        }}
      />
    </div>
  );
};

const AreaListExample = Template.bind({});

AreaListExample.args = {
  areas: [],
  onAreaClick: () => {},
};

export { AreaListExample };

