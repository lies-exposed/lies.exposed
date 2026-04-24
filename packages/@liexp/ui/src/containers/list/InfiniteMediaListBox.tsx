import { type Media } from "@liexp/io/lib/http/index.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as React from "react";
import MediaElement from "../../components/Media/MediaElement.js";
import {
  InfiniteListBox,
  type InfiniteListBoxProps,
} from "./InfiniteListBox/InfiniteListBox.js";
import {
  type CellRendererProps,
  type InfiniteMasonryProps,
} from "./InfiniteListBox/InfiniteMasonry.js";

type InfiniteMediaListBoxProps = Omit<
  InfiniteListBoxProps<"masonry", typeof Endpoints.Media.List>,
  "useListQuery" | "toItems" | "listProps"
> & {
  listProps?:
    Partial<
      Omit<
        InfiniteMasonryProps,
        "width" | "height" | "items" | "getItem" | "CellRenderer"
      >
    > & {
      getItem?: (data: any[], index: number) => any;
    };
  onMediaClick?: (media: Media.Media) => void;
};

export const InfiniteMediaListBox: React.FC<InfiniteMediaListBoxProps> = ({
  listProps = {},
  onMediaClick,
  filter,
  ...props
}) => {
  return (
    <InfiniteListBox<"masonry", typeof Endpoints.Media.List>
      {...{
        filter,
        useListQuery: (Q) => Q.Media.list,
        listProps: {
          type: "masonry",
          getItem: (data: any[], index: number) => {
            return data[index];
          },

          CellRenderer: React.forwardRef<any, CellRendererProps>(
            (
              {
                item,
                measure,
                index: _index,
                style,
                columnWidth,
                onRowInvalidate: _onRowInvalidate,
                ..._others
              },
              ref,
            ) => {
              // console.log("row render", columnWidth, index, style);

              return (
                <div ref={ref} style={{ ...style, width: columnWidth }}>
                  <MediaElement
                    media={item}
                    style={{
                      maxWidth: columnWidth,
                      maxHeight: style?.height ?? 300,
                    }}
                    itemStyle={{ maxWidth: "100%", maxHeight: "100%" }}
                    disableZoom
                    onClick={() => onMediaClick?.(item)}
                    onLoad={measure}
                  />
                </div>
              );
            },
          ),
          ...(listProps as any),
        },
        ...props,
      }}
    />
  );
};
