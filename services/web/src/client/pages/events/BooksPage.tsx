import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { BOOK } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type SearchBookEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchBookEvent.js";
import { BookCard } from "@liexp/ui/lib/components/Cards/Events/BookCard.js";
import { CellRenderer } from "@liexp/ui/lib/containers/list/InfiniteListBox/CellRenderer.js";
import { InfiniteListBox } from "@liexp/ui/lib/containers/list/InfiniteListBox/InfiniteListBox.js";
import * as React from "react";
import { useNavigate } from "react-router";

export const BooksPage: React.FC = () => {
  const navigate = useNavigate();

  const onBookClick = (book: SearchBookEvent) => {
    void navigate(`/events/${book.id}`);
  };

  return (
    <InfiniteListBox<"masonry", typeof Endpoints.Event.Custom.SearchEvents>
      useListQuery={(Q) => Q.Event.Custom.SearchEvents as any}
      filter={{
        filter: {
          eventType: [BOOK.literals[0]],
          _start: "0",
          _end: "50",
        },
      }}
      toItems={(r) => [...r.events]}
      getTotal={(r) => r.total}
      listProps={{
        type: "masonry",
        getItem: (data: any[], index: any) => {
          return data[index];
        },
        CellRenderer: CellRenderer((props) => (
          <BookCard
            event={props.item as SearchBookEvent}
            showRelations={false}
            onLoad={props.measure}
            onEventClick={onBookClick}
            style={{
              width: props.columnWidth,
              height: "100%",
            }}
          />
        )),
      }}
    />
  );
};
