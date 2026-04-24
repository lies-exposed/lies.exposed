import { type Link } from "@liexp/io/lib/http/index.js";
import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import * as React from "react";
import LinkCard from "../../components/Cards/LinkCard.js";
import {
  InfiniteListBox,
  type InfiniteListBoxProps,
} from "./InfiniteListBox/InfiniteListBox.js";
import {
  type CellRendererProps,
  type InfiniteMasonryProps,
} from "./InfiniteListBox/InfiniteMasonry.js";

type InfiniteLinksListBoxProps = Omit<
  InfiniteListBoxProps<"masonry", typeof Endpoints.Link.List>,
  "useListQuery" | "listProps"
> & {
  listProps?: Partial<
    Omit<
      InfiniteMasonryProps,
      "width" | "height" | "items" | "getItem" | "CellRenderer"
    >
  > & {
    type?: "masonry";
    getItem?: (data: any[], index: number) => any;
  };
  onLinkClick?: (media: Link.Link) => void;
};

export const InfiniteLinksListBox: React.FC<InfiniteLinksListBoxProps> = ({
  listProps: { getItem, ...listProps } = {},
  onLinkClick,
  filter,
  ...props
}) => {
  return (
    <InfiniteListBox<"masonry", typeof Endpoints.Link.List>
      {...{
        filter,
        useListQuery: (Q) => Q.Link.list,
        listProps: {
          type: "masonry",
          getItem: (data: any[], index: number) => {
            return getItem ? getItem(data, index) : data[index];
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
              const link = {
                ...(item as Link.Link),
                selected: true,
              };

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
                    link={link}
                    style={{
                      width: columnWidth,
                      // width: "100%",
                      height: "auto",
                    }}
                    onClick={() => onLinkClick?.(link)}
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
