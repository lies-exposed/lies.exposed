import RunIcon from "@mui/icons-material/PlayCircleOutline";
import * as React from "react";
import {
  searchEventsQuery,
  SearchEventsQueryInputNoPagination,
} from "../../state/queries/SearchEventsQuery";
import { styled, useTheme } from "../../theme";
import QueriesRenderer from "../QueriesRenderer";
import { EventsAppBarMinimized } from "../events/EventsAppBarMinimized";
import { Box, CloseIcon, IconButton, Modal } from "../mui";
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
    margin: theme.spacing(2),
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

const EventSliderModal: React.FC<EventSliderModalProps> = ({
  open: _open,
  query: _query,
  onQueryChange,
  onQueryClear,
  ...props
}) => {
  const theme = useTheme();

  const [open, setOpen] = React.useState(_open ?? false);

  const [current, setCurrent] = React.useState(0);

  const hash = "slider";

  const query = React.useMemo(
    () => ({
      ..._query,
      _start: current,
      _end: current + 3,
      hash,
    }),
    [_query, current]
  );

  // console.log({ url, selectedSuggestion, createDisabled });

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
            setOpen(true);
          }}
        >
          <RunIcon fontSize="large" />
        </IconButton>
      </Box>
      <StyledModal
        className={classes.modal}
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <QueriesRenderer
          queries={{
            events: searchEventsQuery(query),
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
                      setOpen(false);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>

                <EventSlider
                  {...props}
                  events={events}
                  totals={totals}
                  slider={{
                    beforeChange: (c, n) => {
                      setCurrent(n + current);
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
