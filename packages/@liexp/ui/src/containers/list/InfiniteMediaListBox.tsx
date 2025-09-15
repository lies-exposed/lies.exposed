import { type Endpoints } from "@liexp/shared/lib/endpoints";
import { type Media } from "@liexp/shared/lib/io/http";
import * as React from "react";
import MediaElement from "../../components/Media/MediaElement.js";
import {
  InfiniteListBox,
  type InfiniteListBoxProps,
  type ListType,
} from "./InfiniteListBox/InfiniteListBox.js";
import { type CellRendererProps } from "./InfiniteListBox/InfiniteMasonry.js";

type InfiniteMediaListBoxProps = Omit<
  InfiniteListBoxProps<ListType, typeof Endpoints.Media.List>,
  "useListQuery" | "toItems"
> & {
  onMediaClick?: (media: Media.Media) => void;
};

export const InfiniteMediaListBox: React.FC<InfiniteMediaListBoxProps> = ({
  listProps,
  onMediaClick,
  filter,
  ...props
}) => {
  return (
    <InfiniteListBox<typeof listProps.type, typeof Endpoints.Media.List>
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
                index,
                style,
                columnWidth,
                onRowInvalidate,
                ...others
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
