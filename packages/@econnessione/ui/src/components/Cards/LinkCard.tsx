import { http } from "@econnessione/shared/io";
import { formatDate } from "@econnessione/shared/utils/date";
import {
  Avatar,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
} from "@material-ui/core";
import LinkIcon from "@material-ui/icons/LinkOutlined";
import ShareIcon from "@material-ui/icons/ShareOutlined";
import * as React from "react";

interface LinkCardProps {
  link: http.Link.Link;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  return (
    <Card>
      <CardHeader
        avatar={<Avatar aria-label="recipe">{link.provider}</Avatar>}
        title={link.title}
        subheader={link.publishDate ? formatDate(link.publishDate) : undefined}
      />
      <CardHeader>{link.title}</CardHeader>
      <CardMedia image={link.image} />

      <CardContent>
        <Typography variant="body2">{link.description}</Typography>
      </CardContent>
      <CardActions disableSpacing>
        <IconButton
          aria-label="add to favorites"
          onClick={() => {
            window.open(link.url, "_blank");
          }}
        >
          <LinkIcon />
        </IconButton>
        <IconButton aria-label="share">
          <ShareIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default LinkCard;
