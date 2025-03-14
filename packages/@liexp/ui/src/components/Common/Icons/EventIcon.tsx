import { type IconName } from "@fortawesome/fontawesome-svg-core";
import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import {
  EventTypes,
  type Event,
} from "@liexp/shared/lib/io/http/Events/index.js";
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
  [EventTypes.BOOK.Type]: "#B5F425",
  [EventTypes.UNCATEGORIZED.Type]: "#EC3535",
  [EventTypes.DEATH.Type]: "#111111",
  [EventTypes.SCIENTIFIC_STUDY.Type]: "#2596be",
  [EventTypes.PATENT.Type]: "#BE259E",
  [EventTypes.DOCUMENTARY.Type]: "#2538BE",
  [EventTypes.TRANSACTION.Type]: "#2DBE25",
  [EventTypes.QUOTE.Type]: "#451ade",
};

export const EventTypeIconClass = {
  [EventTypes.BOOK.Type]: "book" as IconName,
  [EventTypes.DEATH.Type]: "skull-crossbones" as IconName,
  [EventTypes.SCIENTIFIC_STUDY.Type]: "flask" as IconName,
  [EventTypes.PATENT.Type]: "barcode" as IconName,
  [EventTypes.DOCUMENTARY.Type]: "film" as IconName,
  [EventTypes.TRANSACTION.Type]: "money-bill-1-wave" as IconName,
  [EventTypes.QUOTE.Type]: "quote-left" as IconName,
  [EventTypes.UNCATEGORIZED.Type]: "calendar" as IconName,
};

interface EventIconProps extends Omit<FontAwesomeIconProps, "icon"> {
  type: Event["type"];
}

export const EventIcon: React.FC<EventIconProps> = ({
  type,
  width = 18,
  height = 18,
  ..._props
}) => {
  const props = { ..._props, width, height };
  switch (type) {
    case EventTypes.BOOK.Type:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Book}
          style={{ ...props.style, color: EventTypeColor.Book }}
        />
      );
    case EventTypes.QUOTE.Type:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Quote}
          style={{ ...props.style, color: EventTypeColor.Quote }}
        />
      );
    case EventTypes.SCIENTIFIC_STUDY.Type:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.ScientificStudy}
          style={{ ...props.style, color: EventTypeColor.ScientificStudy }}
        />
      );
    case EventTypes.DEATH.Type:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Death}
          style={{ ...props.style, color: EventTypeColor.Death }}
        />
      );
    case EventTypes.PATENT.Type:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Patent}
          style={{ ...props.style, color: EventTypeColor.Patent }}
        />
      );
    case EventTypes.DOCUMENTARY.Type:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Documentary}
          style={{ ...props.style, color: EventTypeColor.Documentary }}
        />
      );
    case EventTypes.TRANSACTION.Type:
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
