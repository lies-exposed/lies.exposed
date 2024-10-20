import { type Endpoints } from "@liexp/shared/lib/endpoints";
import { type Link } from "@liexp/shared/lib/io/http";
import * as React from "react";

import LinkCard from "../../components/Cards/LinkCard";
import {
  InfiniteListBox,
  type InfiniteListBoxProps,
  type ListType,
} from "./InfiniteListBox/InfiniteListBox";
import { type CellRendererProps } from "./InfiniteListBox/InfiniteMasonry";

type InfiniteLinksListBoxProps = Omit<
  InfiniteListBoxProps<ListType, typeof Endpoints.Link.List>,
  "useListQuery"
> & {
  onLinkClick?: (media: Link.Link) => void;
};

export const InfiniteLinksListBox: React.FC<InfiniteLinksListBoxProps> = ({
  listProps: { getItem, type, ...listProps },
  onLinkClick,
  filter,
  ...props
}) => {
  return (
    <InfiniteListBox<"masonry", typeof Endpoints.Link.List>
      {...{
        filter,
        useListQuery: (Q) => Q.Queries.Link.list,
        listProps: {
          type: "masonry",
          getItem: (data: any[], index: number) => {
            return getItem ? getItem(data, index) : data[index];
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
                  <LinkCard
                    link={item}
                    style={{
                      width: columnWidth,
                      // width: "100%",
                      height: "auto",
                    }}
                    onClick={() => onLinkClick?.(item)}
                  />
                </div>
              );
            },
          ),
          ...listProps,
        },
        ...props,
      }}
    />
  );
};
