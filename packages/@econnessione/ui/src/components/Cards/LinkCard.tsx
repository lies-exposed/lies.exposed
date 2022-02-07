import { http } from "@econnessione/shared/io";
import { formatDate } from "@econnessione/shared/utils/date";
import {
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
        title={<Typography variant="subtitle1">{link.title}</Typography>}
        subheader={
          link.publishDate ? (
            <Typography variant="caption">
              {formatDate(link.publishDate)}
            </Typography>
          ) : undefined
        }
      />
      <CardHeader>{link.title}</CardHeader>
      <CardMedia component="img" image={link.image} />

      <CardContent>
        <Typography variant="body2">
          {link.description?.substring(0, 40).concat("...")}
        </Typography>
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
