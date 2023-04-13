import { type http } from "@liexp/shared/lib/io";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date";
import LinkIcon from "@mui/icons-material/LinkOutlined";
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
        maxHeight: 200,
      }}
      onClick={() => { onClick(link); }}
    >
      <CardMedia
        component="img"
        image={link.image?.thumbnail}
        loading="lazy"
        style={{
          height: 300,
          display: "flex",
          flexBasis: '40%',
          flexGrow: 0,
          flexShrink: 1,
        }}
      />
      <Box
        style={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 3,
          flexShrink: 0,
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
            aria-label="Open link in a new tab"
            onClick={() => {
              window.open(link.url, "_blank");
            }}
            size="small"
          >
            <LinkIcon />
          </IconButton>
        </CardActions>
      </Box>
    </Card>
  );
};

export default LinkCard;
