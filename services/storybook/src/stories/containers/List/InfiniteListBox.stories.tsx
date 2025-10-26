/* eslint-disable */
import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import MediaElement from "@liexp/ui/lib/components/Media/MediaElement.js";
import { ActorListItem } from "@liexp/ui/lib/components/lists/ActorList.js";
import { AreaListItem } from "@liexp/ui/lib/components/lists/AreaList.js";
import {
  InfiniteListBox,
  type InfiniteListBoxProps,
  type ListType,
} from "@liexp/ui/lib/containers/list/InfiniteListBox/InfiniteListBox.js";
import { type CellRendererProps } from "@liexp/ui/lib/containers/list/InfiniteListBox/InfiniteMasonry.js";
import { type Meta, type StoryFn } from "@storybook/react-vite";
import * as React from "react";

const meta: Meta = {
  title: "Containers/List/InfiniteListBox",
  component: InfiniteListBox,
};

export default meta;

const Template: StoryFn<InfiniteListBoxProps<ListType, any>> = (props) => {
  return (
    <div style={{ height: 800, position: "relative" }}>
      <InfiniteListBox {...(props as any)} />
    </div>
  );
};

const InfiniteMediaListBoxExample = Template.bind({});

const args: InfiniteListBoxProps<"masonry", typeof Endpoints.Media.List> = {
  params: undefined,
  filter: {},
  useListQuery: (Q) => Q.Media.list,
  listProps: {
    type: "masonry",
    getItem: (data: any[], index: number) => {
      return data[index];
    },

    CellRenderer: React.forwardRef<any, CellRendererProps>(
      ({ item, measure, index, style, columnWidth, isLast, isScrolling, onRowInvalidate, ...others }, ref) => {

        return (
          <div ref={ref} style={{ ...style, width: columnWidth, height: '100%' }}>
            <MediaElement
              media={item}
              style={{ maxWidth: columnWidth, maxHeight: style?.height ?? 300, height: '100%' }}
              itemStyle={{ maxWidth: "100%", maxHeight: "100%" }}
              onLoad={measure}
              disableZoom
              {...others}
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
  params: undefined,
  filter: {},
  useListQuery: (Q) => Q.Area.list,
  listProps: {
    type: "masonry",
    getItem: (data: any[], index: number) => {
      return data[index];
    },

    CellRenderer: React.forwardRef<any, CellRendererProps>(
      ({ item, measure, index, style, columnWidth, ...others }, ref) => {
        // console.log("row render", others);

        return (
          <div ref={ref} style={{ ...style, width: columnWidth }}>
            <AreaListItem
              item={item}
              style={{ height: 300 }}
              defaultImage="https://placekitten.com/600/500"
              onLoad={measure}
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
  params: undefined,
  filter: {},
  useListQuery: (Q) => Q.Actor.list,
  listProps: {
    type: "masonry",
    getItem: (data: any[], index: any) => {
      return data[index];
    },

    CellRenderer: React.forwardRef<any, CellRendererProps>(
      ({ item, measure, index, style, columnWidth, ...others }, ref) => {
        // console.log("row render", others);

        return (
          <div ref={ref} style={{ ...style, width: columnWidth }}>
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
