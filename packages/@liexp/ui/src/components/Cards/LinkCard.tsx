import { http } from "@liexp/shared/io";
import { formatDate, parseISO } from "@liexp/shared/utils/date";
import LinkIcon from "@mui/icons-material/LinkOutlined";
import ShareIcon from "@mui/icons-material/ShareOutlined";
import * as React from "react";
import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
} from "../mui";

export interface Link extends http.Link.Link {
  selected: boolean;
}

export interface LinkCardProps {
  link: Link;
  onClick: (l: Link) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({ link, onClick }) => {
  const title = link.title?.substring(0, 20).concat("...");
  const publishDate = link.publishDate
    ? typeof link.publishDate === "string"
      ? parseISO(link.publishDate)
      : link.publishDate
    : undefined;

  return (
    <Card
      variant={link.selected ? "outlined" : "elevation"}
      style={{
        display: "flex",
        width: "100%",
        flexDirection: "row",
        height: "100%",
        maxHeight: 300,
      }}
      onClick={() => onClick(link)}
    >
      <CardMedia
        component="img"
        image={link.image?.thumbnail}
        loading="lazy"
        style={{
          height: 300,
          width: "100%",
          display: "flex",
        }}
      />
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <CardHeader
          title={<Typography variant="subtitle1">{title}</Typography>}
          subheader={
            publishDate ? (
              <Typography variant="caption">
                {formatDate(publishDate)}
              </Typography>
            ) : undefined
          }
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
            size="large"
          >
            <LinkIcon />
          </IconButton>
          <IconButton aria-label="share" size="large">
            <ShareIcon />
          </IconButton>
        </CardActions>
      </Box>
    </Card>
  );
};

export default LinkCard;
