import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Death,
  Documentary,
  Event,
  Patent,
  ScientificStudy,
  Transaction,
} from "@liexp/shared/io/http/Events";
import { SvgIconProps } from "@material-ui/core";
import { EventNote } from "@material-ui/icons";
import * as React from "react";

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
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={"barcode"}
          style={{ ...props.style, color: "purple" }}
        />
      );
    case Documentary.DOCUMENTARY.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={"film"}
          style={{ ...props.style, color: "lightblue" }}
        />
      );
      case Transaction.TRANSACTION.value:
        return (
          <FontAwesomeIcon
            {...props}
            mask={undefined}
            icon={"money-bill-1-wave"}
            style={{ ...props.style, color: "green" }}
          />
        );
    default:
      return <EventNote {...props} />;
  }
};
