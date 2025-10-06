import { getTitleForSearchEvent } from "@liexp/shared/lib/helpers/event/getTitle.helper.js";
import { type Events } from "@liexp/shared/lib/io/http/index.js";
import { getTextContentsCapped } from "@liexp/shared/lib/providers/blocknote/getTextContentsCapped.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import { EventIcon } from "../../Common/Icons/index.js";
import KeywordList from "../../lists/KeywordList.js";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  type CardProps,
} from "../../mui/index.js";

interface EventCardProps extends Omit<CardProps, "onClick"> {
  event: Events.SearchEvent.SearchEvent;
  showRelations: boolean;
  onClick: (e: Events.SearchEvent.SearchEvent) => void;
}

const CreateEventCard: React.FC<EventCardProps> = ({
  event,
  showRelations: _showRelations,
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
            ? getTextContentsCapped(event.excerpt, 200)
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
