import { type EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import RunIcon from "@mui/icons-material/PlayCircleOutline";
import {clsx} from "clsx";
import * as React from "react";
import {
  searchEventsQuery,
  type SearchEventsQueryInputNoPagination,
} from "../../state/queries/SearchEventsQuery";
import { styled, useTheme } from "../../theme";
import QueriesRenderer from "../QueriesRenderer";
import { EventsAppBarMinimized } from "../events/EventsAppBarMinimized";
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
    backgroundColor: theme.palette.common.white,
  },
  [`& .${classes.closeIconBox}`]: {
    display: "flex",
    alignSelf: "flex-end",
  },
  [`& .${classes.content}`]: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
  },
  [`& .${classes.eventsSlider}`]: {
    flexShrink: 1,
    flexGrow: 1,
    overflow: "auto",
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

  const [{ start, current }, setBounds] = React.useState({
    current: _start,
    start: _start,
  });
  const end = start + perPage + 1;
  // const query = React.useMemo((): SearchEventQueryInput => {
  //   // if (current % 10 === 0) {
  //   return {
  //     ..._query,
  //     _start: current,
  //     _end: end,
  //     hash,
  //   };
  //   // }
  // }, [_query, current]);

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
        setBounds({ current: 0, start: start + perPage });
      } else {
        setBounds({ current: nextSlide, start });
      }
    },
    [start, current, query, hash]
  );

  const handleQueryChange = React.useCallback(
    (slide: boolean) => {
      onQueryChange({
        ...query,
        hash,
        slide,
      });
    },
    [query, hash]
  );

  // console.log({ start });
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: theme.palette.background.paper,
      }}
    >
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
                        beforeChange: (c, n) => {
                          handleBeforeSlide(n, totals);
                        },
                      }}
                    />
                  </Box>

                  <EventsAppBarMinimized
                    className={classes.eventsAppBar}
                    query={query}
                    current={appBarCurrent}
                    open={false}
                    totals={totals}
                    onQueryChange={onQueryChange}
                    onQueryClear={onQueryClear}
                    actors={rest.actors.filter((a) =>
                      query.actors?.includes(a.id)
                    )}
                    groups={rest.groups.filter((g) =>
                      query.groups?.includes(g.id)
                    )}
                    groupsMembers={rest.groupsMembers.filter((gm) =>
                      query.groupsMembers?.includes(gm.id)
                    )}
                    keywords={rest.keywords.filter((k) =>
                      query.keywords?.includes(k.id)
                    )}
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
