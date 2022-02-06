import {
  Death,
  Event,
  Patent,
  ScientificStudy,
} from "@econnessione/shared/io/http/Events";
import { SvgIconProps } from "@material-ui/core";
import {
  EventNote,
  HighlightOff,
  LibraryBooks,
  Radio,
} from "@material-ui/icons";
import * as React from "react";

interface EventIconProps extends SvgIconProps {
  type: Event["type"];
}

export const EventIcon: React.FC<EventIconProps> = ({ type, ...props }) => {
  switch (type) {
    case ScientificStudy.ScientificStudyType.value:
      return <LibraryBooks {...props} style={{ color: "lightblue" }} />;
    case Death.DEATH.value:
      return <HighlightOff {...props} style={{ color: "red" }} />;
    case Patent.PATENT.value:
      return <Radio {...props} style={{ color: "purple" }} />;
    default:
      return <EventNote {...props} />;
  }
};
