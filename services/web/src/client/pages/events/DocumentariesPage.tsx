import { type Endpoints } from "@liexp/shared/lib/endpoints/index.js";
import { DOCUMENTARY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type SearchDocumentaryEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent.js";
import EventCard from "@liexp/ui/lib/components/Cards/Events/EventCard.js";
import { CellRenderer } from "@liexp/ui/lib/containers/list/InfiniteListBox/CellRenderer.js";
import { InfiniteListBox } from "@liexp/ui/lib/containers/list/InfiniteListBox/InfiniteListBox.js";
import * as React from "react";
import { useNavigate } from "react-router";

const DocumentariesPage: React.FC = () => {
  const navigate = useNavigate();

  const onEventClick = (book: SearchDocumentaryEvent) => {
    navigate(`/events/${book.id}`);
  };
  return (
    <InfiniteListBox<"masonry", typeof Endpoints.Event.Custom.SearchEvents>
      useListQuery={(Q) => Q.Queries.Event.Custom.SearchEvents as any}
      filter={{
        filter: {
          eventType: [DOCUMENTARY.Type],
          _start: "0",
          _end: "20",
        },
      }}
      toItems={(r) => [...r.data.events]}
      getTotal={(r) => r.data.total}
      listProps={{
        type: "masonry",
        getItem: (data: any[], index: any) => {
          return data[index];
        },
        CellRenderer: CellRenderer((props) => (
          <EventCard
            event={props.item as SearchDocumentaryEvent}
            onEventClick={onEventClick}
            showRelations={false}
            onLoad={props.measure}
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

export default DocumentariesPage;
