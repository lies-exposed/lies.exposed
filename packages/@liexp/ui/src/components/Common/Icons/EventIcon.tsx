import { type IconName } from "@fortawesome/fontawesome-svg-core";
import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { EventTypes, type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import * as React from "react";
import { styled } from "../../../theme/index.js";

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
  [EventTypes.BOOK.value]: "#B5F425",
  [EventTypes.UNCATEGORIZED.value]: "#EC3535",
  [EventTypes.DEATH.value]: "#111111",
  [EventTypes.SCIENTIFIC_STUDY.value]: "#2596be",
  [EventTypes.PATENT.value]: "#BE259E",
  [EventTypes.DOCUMENTARY.value]: "#2538BE",
  [EventTypes.TRANSACTION.value]: "#2DBE25",
  [EventTypes.QUOTE.value]: "#451ade",
};

export const EventTypeIconClass = {
  [EventTypes.BOOK.value]: "book" as IconName,
  [EventTypes.DEATH.value]: "skull-crossbones" as IconName,
  [EventTypes.SCIENTIFIC_STUDY.value]: "flask" as IconName,
  [EventTypes.PATENT.value]: "barcode" as IconName,
  [EventTypes.DOCUMENTARY.value]: "film" as IconName,
  [EventTypes.TRANSACTION.value]: "money-bill-1-wave" as IconName,
  [EventTypes.QUOTE.value]: "quote-left" as IconName,
  [EventTypes.UNCATEGORIZED.value]: "calendar" as IconName,
};

interface EventIconProps extends Omit<FontAwesomeIconProps, "icon"> {
  type: Event["type"];
}

export const EventIcon: React.FC<EventIconProps> = ({ type, ...props }) => {
  switch (type) {
    case EventTypes.BOOK.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Book}
          style={{ ...props.style, color: EventTypeColor.Book }}
        />
      );
    case EventTypes.QUOTE.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Quote}
          style={{ ...props.style, color: EventTypeColor.Quote }}
        />
      );
    case EventTypes.SCIENTIFIC_STUDY.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.ScientificStudy}
          style={{ ...props.style, color: EventTypeColor.ScientificStudy }}
        />
      );
    case EventTypes.DEATH.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Death}
          style={{ ...props.style, color: EventTypeColor.Death }}
        />
      );
    case EventTypes.PATENT.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Patent}
          style={{ ...props.style, color: EventTypeColor.Patent }}
        />
      );
    case EventTypes.DOCUMENTARY.value:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Documentary}
          style={{ ...props.style, color: EventTypeColor.Documentary }}
        />
      );
    case EventTypes.TRANSACTION.value:
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

export const QuoteEventIcon: React.FC<Omit<EventIconProps, "type">> = (
  props,
) => <EventIcon type="Quote" {...props} />;

export const ScientificStudyEventIcon: React.FC<
  Omit<EventIconProps, "type">
> = (props) => <EventIcon type="ScientificStudy" {...props} />;

export const DeathEventIcon: React.FC<Omit<EventIconProps, "type">> = (
  props,
) => <EventIcon type="Death" {...props} />;

export const PatentEventIcon: React.FC<Omit<EventIconProps, "type">> = (
  props,
) => <EventIcon type="Patent" {...props} />;

export const DocumentaryEventIcon: React.FC<Omit<EventIconProps, "type">> = (
  props,
) => <EventIcon type="Documentary" {...props} />;

export const UncategorizedEventIcon: React.FC<Omit<EventIconProps, "type">> = (
  props,
) => <EventIcon type="Uncategorized" {...props} />;

export const TransactionEventIcon: React.FC<Omit<EventIconProps, "type">> = (
  props,
) => <EventIcon type="Transaction" {...props} />;

export const BookEventIcon: React.FC<Omit<EventIconProps, "type">> = (
  props,
) => <EventIcon type="Book" {...props} />;

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
