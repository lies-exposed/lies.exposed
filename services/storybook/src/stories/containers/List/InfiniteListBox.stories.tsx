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

const Template: StoryFn<InfiniteListBoxProps<ListType>> = (props) => {
  return (
    <div style={{ height: 600, position: "relative" }}>
      <InfiniteListBox {...props} />
    </div>
  );
};

const InfiniteMediaListBoxExample = Template.bind({});

const args: InfiniteListBoxProps<"masonry"> = {
  useListQuery: (Q) => Q.Media.list as any,
  listProps: {
    type: "masonry",
    getItem: (data: any[], index: number) => {
      return data[index];
    },
    // eslint-disable-next-line react/display-name
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

InfiniteMediaListBoxExample.args = args;

const InfiniteAreaListBoxExample = Template.bind({});
const infiniteAreaListBoxExampleArgs: InfiniteListBoxProps<"masonry"> = {
  useListQuery: (Q) => Q.Area.list as any,
  listProps: {
    type: "masonry",
    getItem: (data: any[], index: number) => {
      return data[index];
    },
    // eslint-disable-next-line react/display-name
    CellRenderer: React.forwardRef<any, CellRendererProps>(
      ({ item, measure, index, style, ...others }, ref) => {
        // console.log("row render", others);

        React.useEffect(() => {
          measure();
        }, []);
        return (
          <div ref={ref} style={style}>
            <AreaListItem item={item} style={{ height: 300 }} />
          </div>
        );
      },
    ),
  },
};
InfiniteAreaListBoxExample.args = infiniteAreaListBoxExampleArgs;

const InfiniteActorListBoxExample = Template.bind({});
const infiniteActorListBoxArgs: InfiniteListBoxProps<"masonry"> = {
  useListQuery: (Q) => Q.Actor.list as any,
  listProps: {
    type: "masonry",
    getItem: (data: any, index: any) => {
      return data[index];
    },
    // eslint-disable-next-line react/display-name
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

InfiniteActorListBoxExample.args = infiniteActorListBoxArgs;

export {
  InfiniteActorListBoxExample,
  InfiniteAreaListBoxExample,
  InfiniteMediaListBoxExample,
};
