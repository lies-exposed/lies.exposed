import { type SearchEvent } from "@liexp/shared/lib/io/http/Events/SearchEvents/SearchEvent.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { type ResponsiveStyleValue } from "@mui/system";
import * as A from "fp-ts/lib/Array.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { useConfiguration } from "../../../context/ConfigurationContext.js";
import { styled } from "../../../theme/index.js";
import { Grid } from "../../mui/index.js";
import EventCard, { type EventCardProps } from "./EventCard.js";

export interface EventCardGridProps<
  E extends Events.SearchEvent.SearchEvent = Events.SearchEvent.SearchEvent,
> {
  events: E[];
  onEventClick: (e: E) => void;
  showItemRelations?: boolean;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  columns?: ResponsiveStyleValue<number>;
  cardLayout?: EventCardProps<E>["layout"];
  card?: React.FC<EventCardProps<E>>;
}

const PREFIX = "EventCardGrid";
const classes = {
  cardContainer: `${PREFIX}-grid`,
  card: `${PREFIX}-card`,
};

const StyledGrid = styled(Grid)(({ theme }) => ({
  [`& .${classes.cardContainer}`]: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    // padding: theme.spacing(2),
    // height: "100%",
    [theme.breakpoints.down("md")]: {
      height: "auto",
    },
  },
  [`& .${classes.card}`]: {
    height: "100%",
    width: "100%",
    [`${theme.breakpoints.down("md")}`]: {
      height: "auto",
    },
  },
}));

export const EventCardGrid = <E extends SearchEvent>({
  events,
  itemStyle,
  onEventClick,
  showItemRelations = true,
  cardLayout,
  card: Card = EventCard,
  columns,
  ...props
}: EventCardGridProps<E>): React.JSX.Element => {
  const conf = useConfiguration();
  return (
    <StyledGrid container spacing={2} {...props}>
      {pipe(
        events,
        A.map((e) => {
          return (
            <Grid key={e.id} className={classes.cardContainer} size={columns}>
              <Card
                event={e}
                showRelations={showItemRelations}
                className={classes.card}
                onEventClick={onEventClick}
                defaultImage={conf.platforms.web.defaultImage}
                style={{ ...itemStyle, width: "100%" }}
                layout={cardLayout}
              />
            </Grid>
          );
        }),
      )}
    </StyledGrid>
  );
};
