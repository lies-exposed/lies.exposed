import { FontAwesomeIcon, FontAwesomeIconProps } from "@fortawesome/react-fontawesome";
import {
  Death,
  Documentary,
  Event,
  Patent,
  ScientificStudy,
  Transaction,
  Uncategorized,
} from "@liexp/shared/io/http/Events";
import { makeStyles } from "@material-ui/core";
import * as React from "react";

export const EventTypeColor = {
  [Uncategorized.UNCATEGORIZED.value]: "#EC3535",
  [Death.DEATH.value]: "#111111",
  [ScientificStudy.SCIENTIFIC_STUDY.value]: "#2596be",
  [Patent.PATENT.value]: "#BE259E",
  [Documentary.DOCUMENTARY.value]: "#2538BE",
  [Transaction.TRANSACTION.value]: "#2DBE25",
};

const ScientificStudyIcon = ["flask", "f0c3"];
const PatentIcon = ["barcode", "f02a"];

interface EventIconProps extends Omit<FontAwesomeIconProps, 'icon'> {
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
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={"calendar"}
          style={{
            ...props.style,
            color: EventTypeColor.Uncategorized,
          }}
        />
      );
  }
};

const useStyles = makeStyles(() => ({
  fontAwesome: {
    fontFamily: "Font Awesome 6 Free",
  },
}));

export const EventIconInSVG: React.FC<
  EventIconProps & React.SVGProps<SVGTextElement>
> = ({ type, ...props }) => {
  const classes = useStyles();
  const unicode = React.useMemo(() => {
    switch (type) {
      case ScientificStudy.SCIENTIFIC_STUDY.value: {
        return `&#x${ScientificStudyIcon[1]}`;
      }
      default:
        return `&#x${PatentIcon[1]}`;
    }
  }, [type]);

  return (
    <text className={classes.fontAwesome} {...props}>
      {unicode}
    </text>
  );
};
