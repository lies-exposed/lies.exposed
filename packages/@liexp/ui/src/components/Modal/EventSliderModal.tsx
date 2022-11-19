import { EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import RunIcon from "@mui/icons-material/PlayCircleOutline";
import * as React from "react";
import {
  searchEventsQuery,
  SearchEventsQueryInputNoPagination,
} from "../../state/queries/SearchEventsQuery";
import { styled, useTheme } from "../../theme";
import { EventsAppBarMinimized } from "../events/EventsAppBarMinimized";
import { Box, CloseIcon, IconButton, Modal } from "../mui";
import QueriesRenderer from "../QueriesRenderer";
import { EventSlider, EventSliderProps } from "../sliders/EventSlider";

const EVENT_SLIDER_MODAL_PREFIX = "event-slider-modal";

const classes = {
  modal: `${EVENT_SLIDER_MODAL_PREFIX}-modal`,
  paper: `${EVENT_SLIDER_MODAL_PREFIX}-paper`,
  closeIconBox: `${EVENT_SLIDER_MODAL_PREFIX}-close-icon-box`,
};

const StyledModal = styled(Modal)(({ theme }) => ({
  [`&.${classes.modal}`]: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
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
  const start = parseInt((query as any)._start ?? "0", 10);
  // const end = parseInt((query._end as any) ?? "20", 10);

  const [current, setCurrent] = React.useState(start);

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

      const modulo = nextSlide % perPage;

      // console.log({ nextSlide, modulo, current });
      const currentStart = modulo === perPage - 1 ? start + perPage : start;

      // console.log("start", { start, currentStart });

      setCurrent(nextSlide);

      onQueryChange({
        ...query,
        hash,
        _start: currentStart,
        _end: currentStart + perPage,
      } as any);
    },
    [current, query, hash]
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

  // console.log(start);
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
          aria-label="Add Link"
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
        <QueriesRenderer
          queries={{
            events: searchEventsQuery({
              ...query,
              _start: start,
              _end: start + perPage,
            }),
          }}
          render={({ events: { events, totals, ...rest } }) => {
            return (
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

                <EventSlider
                  {...props}
                  events={events.slice(start, start + perPage)}
                  totals={totals}
                  slider={{
                    beforeChange: (c, n) => {
                      handleBeforeSlide(n, totals);
                    },
                  }}
                />
                <EventsAppBarMinimized
                  query={query}
                  tab={0}
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
      </StyledModal>
    </div>
  );
};

export default EventSliderModal;
