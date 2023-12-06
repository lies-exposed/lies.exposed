import { getTitleForSearchEvent } from "@liexp/shared/lib/helpers/event/getTitle.helper";
import { type Events } from "@liexp/shared/lib/io/http";
import { getTextContentsCapped, isValidValue } from "@liexp/shared/lib/slate";
import { formatDate } from "@liexp/shared/lib/utils/date.utils";
import * as React from "react";
import { EventIcon } from "../../Common/Icons";
import KeywordList from "../../lists/KeywordList";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  type CardProps,
} from "../../mui";

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
  const title = getTitleForSearchEvent(event);

  const image = "";

  return (
    <Box
      onClick={() => {
        onClick(event);
      }}
    >
      <Card {...props}>
        <CardMedia component="img" image={image} />
        <CardHeader
          avatar={<EventIcon type={event.type} />}
          title={title}
          subheader={formatDate(event.date)}
        />
        <CardContent>
          {isValidValue(event.excerpt)
            ? getTextContentsCapped(event.excerpt as any, 200)
            : null}
        </CardContent>
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
