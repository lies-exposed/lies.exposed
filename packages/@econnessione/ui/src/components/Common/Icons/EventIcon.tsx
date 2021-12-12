import { Event } from "@econnessione/shared/io/http/Events";
import { SvgIconProps } from "@material-ui/core";
import { EventNote, HighlightOff, LibraryBooks } from "@material-ui/icons";
import * as React from "react";

interface EventIconProps extends SvgIconProps {
  type: Event["type"];
}

export const EventIcon: React.FC<EventIconProps> = ({ type, ...props }) => {
  switch (type) {
    case "ScientificStudy":
      return <LibraryBooks {...props} />;
    case "Death":
      return <HighlightOff {...props} />;
    default:
      return <EventNote {...props} />;
  }
};
