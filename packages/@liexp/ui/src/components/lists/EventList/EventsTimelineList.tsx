import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { type SearchEventQueryResult } from "../../../state/queries/SearchEventsQuery.js";
import { styled } from "../../../theme/index.js";
import { type EventListItemProps } from "./EventListItem.js";
import EventTimelineItem from "./EventTimelineItem.js";

const PREFIX = "EventsTimeline";

const classes = {
  timeline: `${PREFIX}-timeline`,
};

const StyledList = styled("div")(() => ({
  [`&.${classes.timeline}`]: {
    width: "100%",
    height: "100%",
    overflow: "auto",
    paddingTop: 20,
  },
}));

export interface EventsTimelineListProps extends Omit<
  EventListItemProps,
  "event" | "onRowInvalidate"
> {
  events: SearchEventQueryResult;
  width: number;
  height: number;
  total: number;
  onRowsRendered:
    ((info: { startIndex: number; stopIndex: number }) => void) | undefined;
}

const EventsTimelineList: React.ForwardRefRenderFunction<
  unknown,
  EventsTimelineListProps
> = (props, ref) => {
  const {
    height,
    events,
    total: _total,
    onRowsRendered,
    onClick,
    onActorClick,
    onGroupClick,
    onKeywordClick,
    onGroupMemberClick,
    condensed,
    ...listProps
  } = props;

  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const virtualizer = useVirtualizer({
    count: events.events.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 300,
    overscan: 5,
  });

  React.useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index: number) => {
        virtualizer.scrollToIndex(index);
      },
    }),
    [virtualizer],
  );

  const virtualItems = virtualizer.getVirtualItems();

  React.useEffect(() => {
    if (!onRowsRendered || virtualItems.length === 0) {
      return;
    }

    onRowsRendered({
      startIndex: virtualItems[0]?.index ?? 0,
      stopIndex: virtualItems[virtualItems.length - 1]?.index ?? 0,
    });
  }, [onRowsRendered, virtualItems]);

  return (
    <StyledList
      {...listProps}
      className={classes.timeline}
      ref={scrollRef}
      style={{ height }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: virtualizer.getTotalSize(),
        }}
      >
        {virtualItems.map((virtualItem) => {
          const event = events?.events[virtualItem.index];
          const isLast = events?.events[virtualItem.index + 1] === undefined;

          const commonStyle: React.CSSProperties = {
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transform: `translateY(${virtualItem.start}px)`,
          };

          if (!event) {
            return (
              <div
                key={`event-empty-${virtualItem.index}`}
                ref={(node) => {
                  if (node) {
                    virtualizer.measureElement(node);
                  }
                }}
                style={{ ...commonStyle, minHeight: 100 }}
              />
            );
          }

          return (
            <div
              key={event.id}
              ref={(node) => {
                if (node) {
                  virtualizer.measureElement(node);
                }
              }}
              style={commonStyle}
            >
              <EventTimelineItem
                isLast={isLast}
                event={event}
                style={{ width: "100%" }}
                onClick={onClick}
                condensed={condensed}
                onKeywordClick={onKeywordClick}
                onActorClick={onActorClick}
                onGroupClick={onGroupClick}
                onGroupMemberClick={onGroupMemberClick}
                onRowInvalidate={() => {
                  virtualizer.measure();
                }}
                onLoad={() => {
                  virtualizer.measure();
                }}
              />
            </div>
          );
        })}
      </div>
    </StyledList>
  );
};

export default React.forwardRef(EventsTimelineList);
