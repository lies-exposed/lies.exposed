import { http } from "@liexp/shared/io";
import { formatDate } from "@liexp/shared/utils/date";
import LinkIcon from "@mui/icons-material/LinkOutlined";
import ShareIcon from "@mui/icons-material/ShareOutlined";
import * as React from "react";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
} from "../mui";

interface LinkCardProps {
  link: http.Link.Link;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  const title = link.title?.substring(0, 20).concat("...");
  return (
    <Card
      style={{
        display: "flex",
        flexDirection: "column",
        maxHeight: 300,
      }}
    >
      <CardHeader
        title={<Typography variant="subtitle1">{title}</Typography>}
        subheader={
          link.publishDate ? (
            <Typography variant="caption">
              {formatDate(link.publishDate)}
            </Typography>
          ) : undefined
        }
      />
      <CardMedia
        component="img"
        image={link.image?.thumbnail}
        style={{
          maxHeight: 100,
        }}
      />

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
          size="large">
          <LinkIcon />
        </IconButton>
        <IconButton aria-label="share" size="large">
          <ShareIcon />
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default LinkCard;
