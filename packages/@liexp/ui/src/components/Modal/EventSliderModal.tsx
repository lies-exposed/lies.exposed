import { EventType } from "@liexp/shared/lib/io/http/Events";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals";
import RunIcon from "@mui/icons-material/PlayCircleOutline";
import { clsx } from "clsx";
import * as React from "react";
import {
  searchEventsQuery,
  type SearchEventsQueryInputNoPagination,
} from "../../state/queries/SearchEventsQuery";
import { styled, useTheme } from "../../theme";
import QueriesRenderer from "../QueriesRenderer";
import EventsAppBar from "../events/filters/EventsAppBar";
import { Box, CloseIcon, IconButton, Modal } from "../mui";
import { EventSlider, type EventSliderProps } from "../sliders/EventSlider";

const EVENT_SLIDER_MODAL_PREFIX = "event-slider-modal";

const classes = {
  modal: `${EVENT_SLIDER_MODAL_PREFIX}-modal`,
  paper: `${EVENT_SLIDER_MODAL_PREFIX}-paper`,
  closeIconBox: `${EVENT_SLIDER_MODAL_PREFIX}-close-icon-box`,
  content: `${EVENT_SLIDER_MODAL_PREFIX}-content`,
  eventsSlider: `${EVENT_SLIDER_MODAL_PREFIX}-events-slider`,
  eventsAppBar: `${EVENT_SLIDER_MODAL_PREFIX}-events-app-bar`,
};

const StyledModal = styled(Modal)(({ theme }) => ({
  [`&.${classes.modal}`]: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  },
  [`& .${classes.paper}`]: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    // margin: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: "white",
  },
  [`& .${classes.closeIconBox}`]: {
    display: "flex",
    alignSelf: "flex-end",
  },
  [`& .${classes.content}`]: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    maxWidth: "100%",
    // alignItems: "center",
    alignSelf: "center",
  },
  [`& .${classes.eventsSlider}`]: {
    flexShrink: 0,
    flexGrow: 0,
    maxWidth: "80%",
    // margin: 'auto'
    // overflow: "auto",
  },
  [`& .${classes.eventsAppBar}`]: {
    flexShrink: 0,
  },
}));

export interface EventSliderModalProps
  extends Omit<EventSliderProps, "events" | "open" | "totals" | "onClose"> {
  query: SearchEventsQueryInputNoPagination;
  open?: boolean;
  onQueryChange: (q: SearchEventsQueryInputNoPagination) => void;
  onQueryClear: () => void;
}

const perPage = 10;

const EventSliderModal: React.FC<EventSliderModalProps> = ({
  open,
  query,
  onQueryChange,
  onQueryClear,
  ...props
}) => {
  const theme = useTheme();

  // const [open, setOpen] = React.useState(_open ?? false);

  const hash = "slider";
  const _start = parseInt((query as any)._start ?? "0", 10);

  const [{ start, current, eventType }, setBounds] = React.useState({
    current: _start,
    start: _start,
    eventType: query.eventType ?? EventType.types.map((t) => t.value),
  });
  const end = start + perPage + 1;

  // console.log({ url, selectedSuggestion, createDisabled });

  const handleBeforeSlide = React.useCallback(
    (nextSlide: number, totals: EventTotals) => {
      // const total = getTotal(totals, {
      //   uncategorized: true,
      //   documentaries: true,
      //   transactions: true,
      //   deaths: true,
      //   scientificStudies: true,
      //   patents: true,
      // });

      // const modulo = nextSlide % perPage;

      // console.log({ nextSlide, current });
      if (nextSlide === perPage) {
        // onQueryChange({
        //   ...query,
        //   hash,
        //   _start: nextStart,
        //   _end: nextStart + perPage,
        // } as any);
        setBounds({ current: 0, start: start + perPage, eventType });
      } else {
        setBounds({ current: nextSlide, start, eventType });
      }
    },
    [start, current, query, hash],
  );

  const handleQueryChange = React.useCallback(
    (slide: boolean) => {
      onQueryChange({
        ...query,
        hash,
        slide,
      });
    },
    [query, hash],
  );

  // console.log({ start });
  return (
    <div>
      <Box
        style={{
          position: "fixed",
          right: theme.spacing(2),
          bottom: theme.spacing(8),
        }}
      >
        <IconButton
          aria-label="Run slideshow"
          color="secondary"
          size="small"
          onClick={() => {
            handleQueryChange(true);
          }}
        >
          <RunIcon fontSize="large" />
        </IconButton>
      </Box>
      <StyledModal
        className={classes.modal}
        open={open ?? false}
        onClose={() => {
          handleQueryChange(false);
        }}
      >
        <Box className={classes.paper}>
          <Box className={classes.closeIconBox}>
            <IconButton
              aria-label="Close"
              color="secondary"
              size="small"
              style={{ margin: 0 }}
              onClick={() => {
                handleQueryChange(false);
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <QueriesRenderer
            loader="fullsize"
            queries={{
              events: searchEventsQuery({
                ...query,
                _start: start,
                _end: end,
              }),
            }}
            render={({ events: { events, totals, ...rest } }) => {
              const eventsChunk = events.slice(start, end);
              const appBarCurrent = start + current + 1;
              // console.log({ current, perPage, start, appBarCurrent });

              return (
                <Box className={classes.content}>
                  <Box className={clsx(classes.eventsSlider)}>
                    <EventSlider
                      {...props}
                      events={eventsChunk}
                      totals={totals}
                      slider={{
                        dots: false,
                        beforeChange: (c, n) => {
                          handleBeforeSlide(n, totals);
                        },
                      }}
                    />
                  </Box>

                  <EventsAppBar
                    className={classes.eventsAppBar}
                    query={{
                      ...query,
                      eventType,
                    }}
                    current={appBarCurrent}
                    totals={totals}
                    onQueryChange={(q) => {
                      onQueryChange({ ...q, slide: open });
                    }}
                    onQueryClear={() => {}}
                    events={events}
                    actors={rest.actors.map((a) => ({
                      ...a,
                      selected: query.actors?.includes(a.id) ?? false,
                    }))}
                    groups={rest.groups.map((g) => ({
                      ...g,
                      selected: query.groups?.includes(g.id) ?? false,
                    }))}
                    groupsMembers={rest.groupsMembers.map((gm) => ({
                      ...gm,
                      selected: query.groupsMembers?.includes(gm.id) ?? false,
                    }))}
                    keywords={rest.keywords.map((k) => ({
                      ...k,
                      selected: query.keywords?.includes(k.id) ?? false,
                    }))}
                  />
                </Box>
              );
            }}
          />
        </Box>
      </StyledModal>
    </div>
  );
};

export default EventSliderModal;
