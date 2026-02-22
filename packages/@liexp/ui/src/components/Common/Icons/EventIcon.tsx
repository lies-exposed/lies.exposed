import { type IconName } from "@fortawesome/fontawesome-svg-core";
import {
  FontAwesomeIcon,
  type FontAwesomeIconProps,
} from "@fortawesome/react-fontawesome";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { type Event } from "@liexp/io/lib/http/Events/index.js";
import * as React from "react";
import { type Theme } from "../../../theme/index.js";
import { styled, useTheme } from "../../../theme/index.js";

const PREFIX = "EventTypeColor";

const classes = {
  fontAwesome: `${PREFIX}-fontAwesome`,
};

const Root = styled("text")(() => ({
  [`&.${classes.fontAwesome}`]: {
    fontFamily: "Font Awesome 6 Free",
  },
}));

/**
 * Get event type color from theme palette.
 * Exported for use in other components (e.g., graphs, visualizations)
 */
export const getEventTypeColor = (theme: Theme, eventType: string): string => {
  const eventTypePalette = (theme.palette as any).eventType;
  
  // Fallback to legacy EventTypeColor if eventTypePalette is not available
  if (!eventTypePalette) {
    return EventTypeColor[eventType as keyof typeof EventTypeColor] ?? EventTypeColor.Uncategorized;
  }
  
  const colorMap = {
    [EVENT_TYPES.BOOK]: eventTypePalette.book,
    [EVENT_TYPES.UNCATEGORIZED]: eventTypePalette.uncategorized,
    [EVENT_TYPES.DEATH]: eventTypePalette.death,
    [EVENT_TYPES.SCIENTIFIC_STUDY]: eventTypePalette.scientific_study,
    [EVENT_TYPES.PATENT]: eventTypePalette.patent,
    [EVENT_TYPES.DOCUMENTARY]: eventTypePalette.documentary,
    [EVENT_TYPES.TRANSACTION]: eventTypePalette.transaction,
    [EVENT_TYPES.QUOTE]: eventTypePalette.quote,
  };
  return (
    colorMap[eventType as keyof typeof colorMap] ??
    colorMap[EVENT_TYPES.UNCATEGORIZED]
  );
};

// Legacy export for backwards compatibility - maps to theme colors
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
  const theme = useTheme();
  const props = { ..._props, width, height };
  const iconColor = getEventTypeColor(theme, type);

  switch (type) {
    case EVENT_TYPES.BOOK:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Book}
          style={{ ...props.style, color: iconColor }}
        />
      );
    case EVENT_TYPES.QUOTE:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Quote}
          style={{ ...props.style, color: iconColor }}
        />
      );
    case EVENT_TYPES.SCIENTIFIC_STUDY:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.ScientificStudy}
          style={{ ...props.style, color: iconColor }}
        />
      );
    case EVENT_TYPES.DEATH:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Death}
          style={{ ...props.style, color: iconColor }}
        />
      );
    case EVENT_TYPES.PATENT:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Patent}
          style={{ ...props.style, color: iconColor }}
        />
      );
    case EVENT_TYPES.DOCUMENTARY:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Documentary}
          style={{ ...props.style, color: iconColor }}
        />
      );
    case EVENT_TYPES.TRANSACTION:
      return (
        <FontAwesomeIcon
          {...props}
          mask={undefined}
          icon={EventTypeIconClass.Transaction}
          style={{ ...props.style, color: iconColor }}
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
            color: iconColor,
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
