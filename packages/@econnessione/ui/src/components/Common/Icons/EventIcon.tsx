import {
  Death,
  Event,
  Patent,
  ScientificStudy,
} from "@econnessione/shared/io/http/Events";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SvgIconProps } from "@material-ui/core";
import { EventNote, Radio } from "@material-ui/icons";
import * as React from "react";

interface EventIconProps extends SvgIconProps {
  type: Event["type"];
}

export const EventIcon: React.FC<EventIconProps> = ({ type, ...props }) => {
  switch (type) {
    case ScientificStudy.ScientificStudyType.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={"flask"}
          style={{ ...props.style, color: "lightblue" }}
        />
      );
    case Death.DEATH.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={"skull-crossbones"}
          style={{ ...props.style, color: "black" }}
        />
      );
    case Patent.PATENT.value:
      return <Radio {...props} style={{ ...props.style, color: "purple" }} />;
    default:
      return <EventNote {...props} />;
  }
};
