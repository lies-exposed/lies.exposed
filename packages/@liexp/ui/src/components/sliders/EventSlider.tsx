import { type Events } from "@liexp/shared/lib/io/http";
import { type EventTotals } from "@liexp/shared/lib/io/http/Events/EventTotals";
import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme";
import { Slider, type SliderProps } from "../Common/Slider/Slider";
import { Box } from "../mui";
import EventSliderItem, {
  type EventSliderItemBaseProps,
} from "./EventSliderItem";

const EVENT_SLIDER_PREFIX = "event-slider";

const classes = {
  root: `${EVENT_SLIDER_PREFIX}-root`,
  sliderWrapper: `${EVENT_SLIDER_PREFIX}-slider-wrapper`,
  slider: `${EVENT_SLIDER_PREFIX}-slider`,
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
    flexDirection: "column",
    height: "100%",
    marginRight: 20,
    marginLeft: 20,
    [`& .${classes.slider}`]: {
      marginBottom: 25,
      "& .slick-list": {
        height: "100%",
      },
      "& .slick-prev": {
        left: -20,
      },
      ".slick-prev:before": {
        color: theme.palette.common.black,
      },
      "& .slick-next": {
        // right: 0,
        "&.slick-next:before": {
          color: theme.palette.common.black,
        },
      },

      [`& .${classes.sliderItem}`]: {
        maxHeight: 400,
      },
    },
  },
}));
export interface EventSliderProps
  extends Pick<
    EventSliderItemBaseProps,
    "onActorClick" | "onGroupClick" | "onGroupMemberClick" | "onKeywordClick"
  > {
  className?: string;
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
  className,
  ...props
}) => {
  return (
    <StyledBox className={clsx(classes.root, className)}>
      <Box className={classes.sliderWrapper}>
        <Slider
          adaptiveHeight={false}
          infinite={false}
          arrows={true}
          draggable={false}
          dots={true}
          {...slider}
          className={clsx(classes.slider, slider?.className)}
        >
          {events.map((e, index) => {
            return (
              <EventSliderItem
                key={e.id}
                className={classes.sliderItem}
                event={e}
                onClick={onClick}
                {...props}
              />
            );
          })}
        </Slider>
      </Box>
    </StyledBox>
  );
};
