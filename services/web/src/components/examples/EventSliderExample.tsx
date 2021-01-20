import { EventSlider, EventSliderProps } from "@components/sliders/EventSlider";
import { Events } from "@econnessione/shared/lib/io/http";
import { events } from "@mock-data/events";
import { Card } from "baseui/card";
import * as O from "fp-ts/lib/Option";
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
