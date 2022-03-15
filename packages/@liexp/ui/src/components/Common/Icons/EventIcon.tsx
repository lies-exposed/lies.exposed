import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Death,
  Documentary,
  Event,
  Patent,
  ScientificStudy,
  Transaction,
  Uncategorized,
} from "@liexp/shared/io/http/Events";
import { SvgIconProps } from "@material-ui/core";
import { EventNote } from "@material-ui/icons";
import * as React from "react";

export const EventTypeColor = {
  [Uncategorized.UNCATEGORIZED.value]: "red",
  [Death.DEATH.value]: "black",
  [ScientificStudy.SCIENTIFIC_STUDY.value]: "lightblue",
  [Patent.PATENT.value]: "purple",
  [Documentary.DOCUMENTARY.value]: "lightblue",
  [Transaction.TRANSACTION.value]: "green",
};

interface EventIconProps extends SvgIconProps {
  type: Event["type"];
}

export const EventIcon: React.FC<EventIconProps> = ({ type, ...props }) => {
  switch (type) {
    case ScientificStudy.SCIENTIFIC_STUDY.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={"flask"}
          style={{ ...props.style, color: EventTypeColor.ScientificStudy }}
        />
      );
    case Death.DEATH.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={"skull-crossbones"}
          style={{ ...props.style, color: EventTypeColor.Death }}
        />
      );
    case Patent.PATENT.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={"barcode"}
          style={{ ...props.style, color: EventTypeColor.Patent }}
        />
      );
    case Documentary.DOCUMENTARY.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={"film"}
          style={{ ...props.style, color: EventTypeColor.Documentary }}
        />
      );
    case Transaction.TRANSACTION.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={"money-bill-1-wave"}
          style={{ ...props.style, color: EventTypeColor.Transaction }}
        />
      );
    default:
      return <EventNote {...props} />;
  }
};
