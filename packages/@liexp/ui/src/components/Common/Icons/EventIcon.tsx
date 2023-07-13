import { type IconName } from "@fortawesome/fontawesome-svg-core";
import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import {
  Death,
  Documentary,
  type Event,
  Patent,
  Quote,
  ScientificStudy,
  Transaction,
  Uncategorized,
} from "@liexp/shared/lib/io/http/Events";
import * as React from "react";
import { styled } from "../../../theme";

const PREFIX = "EventTypeColor";

const classes = {
  fontAwesome: `${PREFIX}-fontAwesome`,
};

const Root = styled("text")(() => ({
  [`&.${classes.fontAwesome}`]: {
    fontFamily: "Font Awesome 6 Free",
  },
}));

export const EventTypeColor = {
  [Uncategorized.UNCATEGORIZED.value]: "#EC3535",
  [Death.DEATH.value]: "#111111",
  [ScientificStudy.SCIENTIFIC_STUDY.value]: "#2596be",
  [Patent.PATENT.value]: "#BE259E",
  [Documentary.DOCUMENTARY.value]: "#2538BE",
  [Transaction.TRANSACTION.value]: "#2DBE25",
  [Quote.QUOTE.value]: "#451ade",
};

export const EventTypeIconClass = {
  [Uncategorized.UNCATEGORIZED.value]: "calendar" as IconName,
  [Death.DEATH.value]: "skull-crossbones" as IconName,
  [ScientificStudy.SCIENTIFIC_STUDY.value]: "flask" as IconName,
  [Patent.PATENT.value]: "barcode" as IconName,
  [Documentary.DOCUMENTARY.value]: "film" as IconName,
  [Transaction.TRANSACTION.value]: "money-bill-1-wave" as IconName,
  [Quote.QUOTE.value]: "quote-left" as IconName,
};

interface EventIconProps extends Omit<FontAwesomeIconProps, "icon"> {
  type: Event["type"];
}

export const EventIcon: React.FC<EventIconProps> = ({ type, ...props }) => {
  switch (type) {
    case Quote.QUOTE.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Quote}
          style={{ ...props.style, color: EventTypeColor.Quote }}
        />
      );
    case ScientificStudy.SCIENTIFIC_STUDY.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.ScientificStudy}
          style={{ ...props.style, color: EventTypeColor.ScientificStudy }}
        />
      );
    case Death.DEATH.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Death}
          style={{ ...props.style, color: EventTypeColor.Death }}
        />
      );
    case Patent.PATENT.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Patent}
          style={{ ...props.style, color: EventTypeColor.Patent }}
        />
      );
    case Documentary.DOCUMENTARY.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Documentary}
          style={{ ...props.style, color: EventTypeColor.Documentary }}
        />
      );
    case Transaction.TRANSACTION.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Transaction}
          style={{ ...props.style, color: EventTypeColor.Transaction }}
        />
      );
    default:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Uncategorized}
          style={{
            ...props.style,
            color: EventTypeColor.Uncategorized,
          }}
        />
      );
  }
};

export const EventIconInSVG: React.FC<
  EventIconProps & React.SVGProps<SVGTextElement>
> = ({ type, ...props }) => {
  const unicode = React.useMemo(() => {
    return `&#x${EventTypeIconClass[type]}`;
  }, [type]);

  return (
    <Root className={classes.fontAwesome} {...props}>
      {unicode}
    </Root>
  );
};
