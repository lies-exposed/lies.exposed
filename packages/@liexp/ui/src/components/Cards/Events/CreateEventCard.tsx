import { Events } from "@liexp/shared/io/http";
import { formatDate } from "@liexp/shared/utils/date";
import {
  Box,
  Card,
  CardActionArea,
  CardActions,
  CardHeader,
  CardMedia,
  CardProps,
} from "@material-ui/core";
import * as React from "react";
import { EventIcon } from "../../Common/Icons";
import KeywordList from "../../lists/KeywordList";

interface EventCardProps extends Omit<CardProps, "onClick"> {
  event: Events.SearchEvent.SearchEvent;
  showRelations: boolean;
  onClick: (e: Events.SearchEvent.SearchEvent) => void;
}

const CreateEventCard: React.FC<EventCardProps> = ({
  event,
  showRelations,
  onClick,
  ...props
}) => {
  const { keywords } = event;
  const title =
    event.type === Events.Death.DEATH.value ? `Death` : event.payload.title;
  const image = "";

  return (
    <Box onClick={() => onClick(event)}>
      <Card {...props}>
        <CardActionArea>
          <CardMedia component="img" image={image} />
          <CardHeader
            avatar={<EventIcon type={event.type} />}
            title={title}
            subheader={formatDate(event.date)}
          />
        </CardActionArea>
        <CardActions disableSpacing>
          <KeywordList
            keywords={keywords.map((k) => ({ ...k, selected: true }))}
            onItemClick={() => undefined}
          />
        </CardActions>
      </Card>
    </Box>
  );
};

export default CreateEventCard;
