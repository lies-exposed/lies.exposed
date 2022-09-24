import { Events } from "@liexp/shared/io/http";
import { EventTotals } from "@liexp/shared/io/http/Events/SearchEventsQuery";
import * as React from "react";
import { styled } from "../../theme";
import { Slider, SliderProps } from "../Common/Slider/Slider";
import { Box } from "../mui";
import EventSliderItem, { EventSliderItemBaseProps } from "./EventSliderItem";

const EVENT_SLIDER_PREFIX = "event-slider";

const classes = {
  root: `${EVENT_SLIDER_PREFIX}-root`,
  sliderWrapper: `${EVENT_SLIDER_PREFIX}-slider-wrapper`,
  slider: `${EVENT_SLIDER_PREFIX}-slider`,
};

const StyledBox = styled(Box)(({ theme }) => ({
  [`&.${classes.root}`]: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    margin: theme.spacing(3),
  },
  [`& .${classes.sliderWrapper}`]: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  [`& .${classes.slider}`]: {
    marginBottom: 25,
    ".slick-prev:before": {
      color: theme.palette.common.black,
    },
    ".slick-next:before": {
      color: theme.palette.common.black,
    },
  },
}));
export interface EventSliderProps
  extends Pick<
    EventSliderItemBaseProps,
    "onActorClick" | "onGroupClick" | "onGroupMemberClick" | "onKeywordClick"
  > {
  events: Events.SearchEvent.SearchEvent[];
  totals: EventTotals;
  onClick: (e: Events.SearchEvent.SearchEvent) => void;
  slider?: Partial<SliderProps>;
}

export const EventSlider: React.FC<EventSliderProps> = ({
  onClick,
  events,
  totals,
  slider,
  ...props
}) => {
  return (
    <StyledBox className={classes.root}>
      <Box className={classes.sliderWrapper}>
        <Slider
          className={classes.slider}
          adaptiveHeight={false}
          infinite={false}
          arrows={true}
          draggable={false}
          dots={true}
          style={{
            width: "100%",
          }}
          {...slider}
        >
          {events.map((e, index) => {
            return (
              <EventSliderItem
                key={e.id}
                event={e}
                onClick={onClick}
                style={{
                  width: "100%",
                }}
                {...props}
              />
            );
          })}
        </Slider>
      </Box>
    </StyledBox>
  );
};
