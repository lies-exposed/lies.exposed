import { type Events } from "@liexp/shared/lib/io/http";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/SearchEventsQuery";
import { ArrowLeft, ArrowRight } from "@mui/icons-material";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../../theme";
import { Box, Grid, IconButton } from "../../mui";
import {
  EventSliderFlattenItems,
  toSliderItems,
} from "./EventSliderFlattenItems";
import {
  type EventSliderItemBaseProps,
} from "./EventSliderItem";

const EVENT_SLIDER_PREFIX = "event-slider";

const classes = {
  root: `${EVENT_SLIDER_PREFIX}-root`,
  sliderWrapper: `${EVENT_SLIDER_PREFIX}-slider-wrapper`,
  sliderItem: `${EVENT_SLIDER_PREFIX}-slider-item`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    height: "100%",
    flexDirection: "column",
  },
  [`& .${classes.sliderWrapper}`]: {
    display: "flex",
    flexDirection: "row",
    height: "100%",
    marginRight: 20,
    marginLeft: 20,

    marginBottom: 25,
    "& .slick-list": {
      height: "100%",
    },
    "& .prev": {
      display: "flex",
      alignItems: "center",
    },
    ".prev:before": {
      color: theme.palette.common.black,
    },
    "& .next": {
      display: "flex",
      "&.next:before": {
        color: theme.palette.common.black,
      },
    },

    [`& .${classes.sliderItem}`]: {
      maxHeight: 400,
    },
  },
}));
export interface EventSliderProps
  extends Pick<
    EventSliderItemBaseProps,
    "onActorClick" | "onGroupClick" | "onGroupMemberClick" | "onKeywordClick"
  > {
  className?: string;
  slide: number;
  events: Events.SearchEvent.SearchEvent[];
  totals: EventTotals;
  onClick: (e: Events.SearchEvent.SearchEvent) => void;
  onSlideChange: (nextSlide: number) => void;
}

export const EventSlider: React.FC<EventSliderProps> = ({
  slide: currentSlide,
  onClick,
  events,
  totals,
  className,
  onSlideChange,
  ...props
}) => {
  const items = events.map(toSliderItems).flat();
  return (
    <StyledBox className={clsx(classes.root, className)}>
      <Grid className={classes.sliderWrapper}>
        <Grid item className="prev">
          <IconButton
            onClick={() => {
              const prevSlide = currentSlide - 1;
              onSlideChange(prevSlide < 0 ? 0 : prevSlide);
            }}
          >
            <ArrowLeft fontSize="small" />
          </IconButton>
        </Grid>
        <Grid item md={9} style={{ display: 'flex', flexGrow: 1, background: "green" }}>
          <EventSliderFlattenItems
            className={classes.sliderItem}
            current={currentSlide}
            items={items}
            onClick={onClick}
            {...props}
          />
        </Grid>
        <Grid item className="next">
          <IconButton
            onClick={() => {
              onSlideChange(currentSlide + 1);
            }}
          >
            <ArrowRight fontSize="small" />
          </IconButton>
        </Grid>
      </Grid>
    </StyledBox>
  );
};
