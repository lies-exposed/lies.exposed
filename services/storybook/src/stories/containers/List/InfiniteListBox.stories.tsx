import { type Actor, type Area, type Media } from "@liexp/io/lib/http/index.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import MediaElement from "@liexp/ui/lib/components/Media/MediaElement.js";
import { ActorListItem } from "@liexp/ui/lib/components/lists/ActorList.js";
import { AreaListItem } from "@liexp/ui/lib/components/lists/AreaList.js";
import {
  InfiniteListBox,
  type InfiniteListBoxProps,
} from "@liexp/ui/lib/containers/list/InfiniteListBox/InfiniteListBox.js";
import { type CellRendererProps } from "@liexp/ui/lib/containers/list/InfiniteListBox/InfiniteMasonry.js";
import { type Meta } from "@storybook/react-vite";
import * as React from "react";

type MediaListStoryProps = InfiniteListBoxProps<
  "masonry",
  typeof Endpoints.Media.List
>;
type AreaListStoryProps = InfiniteListBoxProps<
  "masonry",
  typeof Endpoints.Area.List
>;
type ActorListStoryProps = InfiniteListBoxProps<
  "masonry",
  typeof Endpoints.Actor.List
>;

const MediaListStoryComponent = (
  props: MediaListStoryProps,
): React.ReactElement => {
  return (
    <div style={{ height: 800, position: "relative" }}>
      <InfiniteListBox<"masonry", typeof Endpoints.Media.List> {...props} />
    </div>
  );
};

const AreaListStoryComponent = (
  props: AreaListStoryProps,
): React.ReactElement => {
  return (
    <div style={{ height: 800, position: "relative" }}>
      <InfiniteListBox<"masonry", typeof Endpoints.Area.List> {...props} />
    </div>
  );
};

const ActorListStoryComponent = (
  props: ActorListStoryProps,
): React.ReactElement => {
  return (
    <div style={{ height: 800, position: "relative" }}>
      <InfiniteListBox<"masonry", typeof Endpoints.Actor.List> {...props} />
    </div>
  );
};

const InfiniteMediaListBoxExample = {
  title: "Containers/List/InfiniteListBox",
  render: MediaListStoryComponent,
  args: {
    params: undefined,
    filter: {},
    useListQuery: (Q) => Q.Media.list,
    listProps: {
      type: "masonry",
      getItem: (data: unknown[], index: number): unknown => data[index],

      CellRenderer: React.forwardRef<HTMLDivElement, CellRendererProps>(
        ({ item, measure, style, columnWidth, ...others }, ref) => {
          const media = item as Media.Media;

          return (
            <div
              ref={ref}
              style={{ ...style, width: columnWidth, height: "100%" }}
            >
              <MediaElement
                media={media}
                style={{
                  maxWidth: columnWidth,
                  maxHeight: style?.height ?? 300,
                  height: "100%",
                }}
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
  },
} satisfies Meta<MediaListStoryProps>;

export default InfiniteMediaListBoxExample;

const InfiniteAreaListBoxExample = {
  render: AreaListStoryComponent,
  args: {
    params: undefined,
    filter: {},
    useListQuery: (Q) => Q.Area.list,
    listProps: {
      type: "masonry",
      getItem: (data: unknown[], index: number): unknown => data[index],

      CellRenderer: React.forwardRef<HTMLDivElement, CellRendererProps>(
        ({ item, measure, style, columnWidth }, ref) => {
          const area = item as Area.Area;

          return (
            <div ref={ref} style={{ ...style, width: columnWidth }}>
              <AreaListItem
                item={{ ...area, selected: true }}
                style={{ height: 300 }}
                defaultImage="https://placekitten.com/600/500"
                onLoad={measure}
              />
            </div>
          );
        },
      ),
    },
  },
} satisfies Meta<AreaListStoryProps>;

const InfiniteActorListBoxExample = {
  render: ActorListStoryComponent,
  args: {
    params: undefined,
    filter: {},
    useListQuery: (Q) => Q.Actor.list,
    listProps: {
      type: "masonry",
      getItem: (data: unknown[], index: number): unknown => data[index],

      CellRenderer: React.forwardRef<HTMLDivElement, CellRendererProps>(
        ({ item, measure, style, columnWidth }, ref) => {
          const actor = item as Actor.Actor;

          return (
            <div ref={ref} style={{ ...style, width: columnWidth }}>
              <ActorListItem
                item={{ ...actor, selected: true }}
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
  },
} satisfies Meta<ActorListStoryProps>;

export { InfiniteActorListBoxExample, InfiniteAreaListBoxExample };
