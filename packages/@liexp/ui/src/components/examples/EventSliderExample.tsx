import * as R from "fp-ts/lib/Record";
import * as React from "react";
import { Card } from "../mui";
import { EventSlider, EventSliderProps } from "../sliders/EventSlider";

export const eventSliderArgs: EventSliderProps = {
  events: [],
  onClick: () => undefined,
  onActorClick: () => undefined,
  onGroupClick: () => undefined,
  onKeywordClick: () => undefined,
  onGroupMemberClick: () => undefined,
  totals: {
    uncategorized: 0,
    transactions: 0,
    deaths: 0,
    documentaries: 0,
    patents: 0,
    scientificStudies: 0
  },
};

export const EventSliderExample: React.FC<EventSliderProps> = (props) => {
  const pageContentProps = R.isEmpty(props as {}) ? eventSliderArgs : props;

  return (
    <Card style={{ width: "100%" }}>
      <EventSlider {...pageContentProps} />
    </Card>
  );
};
