import { EventSlider, EventSliderProps } from "@components/sliders/EventSlider";
import { events } from "@mock-data/events";
import { Card } from "baseui/card";
import * as R from "fp-ts/lib/Record";
import * as React from "react";

export const eventSliderArgs: EventSliderProps = {
  events,
};

export const EventSliderExample: React.FC<EventSliderProps> = (props) => {
  const pageContentProps = R.isEmpty(props as {}) ? eventSliderArgs : props;

  return (
    <Card overrides={{ Root: { style: { width: "100%" } } }}>
      <EventSlider {...pageContentProps} />
    </Card>
  );
};
