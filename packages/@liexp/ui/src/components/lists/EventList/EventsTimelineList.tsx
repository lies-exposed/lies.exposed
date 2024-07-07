import * as React from "react";
import {
  CellMeasurer,
  CellMeasurerCache,
  List,
  type ListRowProps,
} from "react-virtualized";
import { type RenderedRows } from "react-virtualized/dist/es/List.js";
import { type SearchEventQueryResult } from "../../../state/queries/SearchEventsQuery.js";
import { styled } from "../../../theme/index.js";
import { type EventListItemProps } from "./EventListItem.js";
import EventTimelineItem, {
  type EventTimelineItemProps,
} from "./EventTimelineItem.js";

const PREFIX = "EventsTimeline";

const classes = {
  timeline: `${PREFIX}-timeline`,
  listSubheader: `${PREFIX}-listSubheader`,
  listItemUList: `${PREFIX}-listItemUList`,
};

const StyledList = styled(List)(({ theme }) => ({
  [`&.${classes.timeline}`]: {
    padding: 0,
    paddingTop: 20,
    width: "100%",
  },

  [`& .${classes.listSubheader}`]: {
    backgroundColor: theme.palette.common.white,
  },

  [`& .${classes.listItemUList}`]: {
    padding: 0,
    width: "100%",
  },
}));

const cellCache = new CellMeasurerCache({
  fixedWidth: true,
  minWidth: 200,
});

const Row: React.FC<
  ListRowProps &
    Omit<EventTimelineItemProps, "onLoad" | "onRowInvalidate"> & { k: string }
> = (props) => {
  const {
    event,
    onClick,
    onKeywordClick,
    onActorClick,
    onGroupClick,
    onGroupMemberClick,
    isVisible,
    isLast,
    style,
    parent,
    index,
    k: key,
    condensed,
  } = props;

  return (
    <CellMeasurer
      key={key}
      cache={cellCache}
      columnIndex={0}
      rowIndex={index}
      parent={parent}
    >
      {({ registerChild, measure }) => {
        if (!event) {
          return (
            <div ref={registerChild as any} key={key} style={{ height: 100 }} />
          );
        }

        if (!isVisible) {
          return (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 100,
                width: "100%",
                ...props.style,
              }}
            />
          );
        }

        return (
          <EventTimelineItem
            ref={registerChild}
            isLast={isLast}
            event={event}
            style={style}
            onClick={onClick}
            condensed={condensed}
            onKeywordClick={onKeywordClick}
            onActorClick={onActorClick}
            onGroupClick={onGroupClick}
            onGroupMemberClick={onGroupMemberClick}
            onRowInvalidate={() => {
              cellCache.clear(index, 0);
              setTimeout(() => {
                measure();
              }, 300);
            }}
            onLoad={measure}
          />
        );
      }}
    </CellMeasurer>
  );
};

export interface EventsTimelineListProps
  extends Omit<EventListItemProps, "event" | "onRowInvalidate"> {
  events: SearchEventQueryResult;
  width: number;
  height: number;
  total: number;
  onRowsRendered: ((info: RenderedRows) => void) | undefined;
}

const EventsTimelineList: React.ForwardRefRenderFunction<
  unknown,
  EventsTimelineListProps
> = (props, ref) => {
  const {
    height,
    width,
    events,
    total,
    onRowsRendered,
    onClick,
    onActorClick,
    onGroupClick,
    onKeywordClick,
    onGroupMemberClick,
    condensed,
    ...listProps
  } = props;

  // const isDownSM = useMediaQuery(theme.breakpoints.down("sm"));

  const rowProps = {
    condensed,
    onClick,
    onActorClick,
    onGroupClick,
    onGroupMemberClick,
    onKeywordClick,
  };

  return (
    <StyledList
      {...listProps}
      className={classes.timeline}
      ref={ref}
      width={width}
      height={height}
      estimatedRowSize={300}
      overscanRowCount={5}
      onRowsRendered={onRowsRendered}
      rowRenderer={({ key, ...props }) => {
        const event = events?.events[props.index];
        const isLast = events?.events[props.index + 1] === undefined;

        return (
          <Row
            {...rowProps}
            {...props}
            key={key}
            k={key}
            event={event}
            isLast={isLast}
          />
        );
      }}
      rowCount={events.events.length}
      rowHeight={cellCache.rowHeight}
      deferredMeasurementCache={cellCache}
    />
  );
};

export default React.forwardRef(EventsTimelineList);
