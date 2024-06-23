import { type Endpoints } from "@liexp/shared/lib/endpoints";
import { type Media } from "@liexp/shared/lib/io/http";
import * as React from "react";
import MediaElement from "../../components/Media/MediaElement";
import {
  InfiniteListBox,
  type InfiniteListBoxProps,
  type ListType,
} from "./InfiniteListBox/InfiniteListBox";
import { type CellRendererProps } from "./InfiniteListBox/InfiniteMasonry";

type InfiniteMediaListBoxProps = Omit<
  InfiniteListBoxProps<ListType, typeof Endpoints.Media.List>,
  "useListQuery"
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
        useListQuery: (Q) => Q.Queries.Media.list as any,
        listProps: {
          type: "masonry",
          getItem: (data: any[], index: number) => {
            return data[index];
          },
          // eslint-disable-next-line react/display-name
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

              React.useEffect(() => {
                measure();
                return () => {
                  // console.log("should call on row invalidate");
                  // onRowInvalidate?.();
                };
              }, [style?.width, style?.height]);

              return (
                <div ref={ref} style={style}>
                  <MediaElement
                    media={item}
                    style={{
                      minWidth: columnWidth,
                      width: "100%",
                      height: "auto",
                    }}
                    itemStyle={{ maxWidth: columnWidth, maxHeight: "100%" }}
                    disableZoom
                    onClick={() => onMediaClick?.(item)}
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
