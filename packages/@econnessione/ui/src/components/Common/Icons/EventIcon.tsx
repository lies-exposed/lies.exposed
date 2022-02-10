import {
  Death,
  Event,
  Patent,
  ScientificStudy
} from "@econnessione/shared/io/http/Events";
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro'; // <-- import styles to be used
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { SvgIconProps } from "@material-ui/core";
import { EventNote, HighlightOff, Radio } from "@material-ui/icons";
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
          mask={solid('flask')}
          icon={solid('flask')}
          style={{ color: "lightblue" }}
        />
      );
    case Death.DEATH.value:
      return <HighlightOff {...props} style={{ color: "red" }} />;
    case Patent.PATENT.value:
      return <Radio {...props} style={{ color: "purple" }} />;
    default:
      return <EventNote {...props} />;
  }
};
