import { type Endpoints } from "@liexp/shared/lib/endpoints";
import MediaElement from "@liexp/ui/lib/components/Media/MediaElement";
import { ActorListItem } from "@liexp/ui/lib/components/lists/ActorList";
import { AreaListItem } from "@liexp/ui/lib/components/lists/AreaList";
import {
  InfiniteListBox,
  type InfiniteListBoxProps,
  type ListType,
} from "@liexp/ui/lib/containers/list/InfiniteListBox/InfiniteListBox";
import { type CellRendererProps } from "@liexp/ui/lib/containers/list/InfiniteListBox/InfiniteMasonry";
import { type Meta, type StoryFn } from "@storybook/react";
import * as React from "react";

const meta: Meta = {
  title: "Containers/List/InfiniteListBox",
  component: InfiniteListBox,
};

export default meta;

const Template: StoryFn<InfiniteListBoxProps<ListType, any>> = (props) => {
  return (
    <div style={{ height: 600, position: "relative" }}>
      <InfiniteListBox {...props} />
    </div>
  );
};

const InfiniteMediaListBoxExample = Template.bind({});

const args: InfiniteListBoxProps<"masonry", typeof Endpoints.Media.List> = {
  filter: { filter: {} },
  useListQuery: (Q) => Q.Queries.Media.list,
  listProps: {
    type: "masonry",
    getItem: (data: any[], index: number) => {
      return data[index];
    },

    CellRenderer: React.forwardRef<any, CellRendererProps>(
      ({ item, measure, index, style, ...others }, ref) => {
        // console.log("row render", style);

        return (
          <div ref={ref} style={style}>
            <MediaElement
              media={item}
              style={{ maxWidth: 200, maxHeight: 300 }}
              itemStyle={{ maxWidth: "100%", maxHeight: "100%" }}
              onLoad={measure}
              disableZoom
            />
          </div>
        );
      },
    ),
  },
};

InfiniteMediaListBoxExample.args = args as any;

const InfiniteAreaListBoxExample = Template.bind({});
const infiniteAreaListBoxExampleArgs: InfiniteListBoxProps<
  "masonry",
  typeof Endpoints.Area.List
> = {
  filter: {
    filter: {},
  },
  useListQuery: (Q) => Q.Queries.Area.list,
  listProps: {
    type: "masonry",
    getItem: (data: any[], index: number) => {
      return data[index];
    },

    CellRenderer: React.forwardRef<any, CellRendererProps>(
      ({ item, measure, index, style, ...others }, ref) => {
        // console.log("row render", others);

        React.useEffect(() => {
          measure();
        }, []);
        return (
          <div ref={ref} style={style}>
            <AreaListItem
              item={item}
              style={{ height: 300 }}
              defaultImage="https://placekitten.com/600/500"
            />
          </div>
        );
      },
    ),
  },
};
InfiniteAreaListBoxExample.args = infiniteAreaListBoxExampleArgs as any;

const InfiniteActorListBoxExample = Template.bind({});
const infiniteActorListBoxArgs: InfiniteListBoxProps<
  "masonry",
  typeof Endpoints.Actor.List
> = {
  filter: { filter: {} },
  useListQuery: (Q) => Q.Queries.Actor.list,
  listProps: {
    type: "masonry",
    getItem: (data: any, index: any) => {
      return data[index];
    },

    CellRenderer: React.forwardRef<any, CellRendererProps>(
      ({ item, measure, index, style, ...others }, ref) => {
        // console.log("row render", others);

        return (
          <div ref={ref} style={style}>
            <ActorListItem
              item={{ ...item, selected: true }}
              displayFullName
              avatarSize="large"
              onClick={() => {}}
              onLoad={measure}
            />
          </div>
        );
      },
    ),
  },
};

InfiniteActorListBoxExample.args = infiniteActorListBoxArgs as any;

export {
  InfiniteActorListBoxExample,
  InfiniteAreaListBoxExample,
  InfiniteMediaListBoxExample,
};
