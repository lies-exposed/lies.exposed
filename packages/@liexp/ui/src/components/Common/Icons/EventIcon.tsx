import { type IconName } from "@fortawesome/fontawesome-svg-core";
import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
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
  [EVENT_TYPES.BOOK]: "#B5F425",
  [EVENT_TYPES.UNCATEGORIZED]: "#EC3535",
  [EVENT_TYPES.DEATH]: "#111111",
  [EVENT_TYPES.SCIENTIFIC_STUDY]: "#2596be",
  [EVENT_TYPES.PATENT]: "#BE259E",
  [EVENT_TYPES.DOCUMENTARY]: "#2538BE",
  [EVENT_TYPES.TRANSACTION]: "#2DBE25",
  [EVENT_TYPES.QUOTE]: "#451ade",
};

export const EventTypeIconClass = {
  [EVENT_TYPES.BOOK]: "book" as IconName,
  [EVENT_TYPES.DEATH]: "skull-crossbones" as IconName,
  [EVENT_TYPES.SCIENTIFIC_STUDY]: "flask" as IconName,
  [EVENT_TYPES.PATENT]: "barcode" as IconName,
  [EVENT_TYPES.DOCUMENTARY]: "film" as IconName,
  [EVENT_TYPES.TRANSACTION]: "money-bill-1-wave" as IconName,
  [EVENT_TYPES.QUOTE]: "quote-left" as IconName,
  [EVENT_TYPES.UNCATEGORIZED]: "calendar" as IconName,
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
    case EVENT_TYPES.BOOK:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Book}
          style={{ ...props.style, color: EventTypeColor.Book }}
        />
      );
    case EVENT_TYPES.QUOTE:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Quote}
          style={{ ...props.style, color: EventTypeColor.Quote }}
        />
      );
    case EVENT_TYPES.SCIENTIFIC_STUDY:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.ScientificStudy}
          style={{ ...props.style, color: EventTypeColor.ScientificStudy }}
        />
      );
    case EVENT_TYPES.DEATH:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Death}
          style={{ ...props.style, color: EventTypeColor.Death }}
        />
      );
    case EVENT_TYPES.PATENT:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Patent}
          style={{ ...props.style, color: EventTypeColor.Patent }}
        />
      );
    case EVENT_TYPES.DOCUMENTARY:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Documentary}
          style={{ ...props.style, color: EventTypeColor.Documentary }}
        />
      );
    case EVENT_TYPES.TRANSACTION:
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
