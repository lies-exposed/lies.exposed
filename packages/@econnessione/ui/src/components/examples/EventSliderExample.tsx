import { Card } from "@material-ui/core";
import * as R from "fp-ts/lib/Record";
import * as React from "react";
import { EventSlider, EventSliderProps } from "../sliders/EventSlider";

export const eventSliderArgs: EventSliderProps = {
  params: {} as any,
  onClick: () => undefined,
};

export const EventSliderExample: React.FC<EventSliderProps> = (props) => {
  const pageContentProps = R.isEmpty(props as {}) ? eventSliderArgs : props;

  return (
    <Card style={{ width: "100%" }}>
      <EventSlider {...pageContentProps} />
    </Card>
  );
};
