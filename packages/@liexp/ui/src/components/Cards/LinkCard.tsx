import { type http } from "@liexp/shared/lib/io/index.js";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  IconButton,
  Typography,
  Icons,
  Stack,
} from "../mui/index.js";

export interface Link extends http.Link.Link {
  selected: boolean;
}

export interface LinkCardProps {
  link: Link;
  variant?: "horizontal" | "vertical";
  style?: React.CSSProperties;
  onClick: (l: Link) => void;
}

const LinkCard: React.FC<LinkCardProps> = ({
  link,
  variant = "vertical",
  style,
  onClick,
}) => {
  const title = link.title ?? "untitled";
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
        flexDirection: "column",
        height: "100%",
        ...style,
      }}
      onClick={() => {
        onClick(link);
      }}
    >
      <Stack
        flexDirection={variant === "vertical" ? "column" : "row"}
        spacing={2}
      >
        {link.image ? (
          <CardMedia
            component="img"
            image={link.image?.thumbnail}
            loading="lazy"
            style={{
              height: 200,
              display: "flex",
              maxWidth: variant === "horizontal" ? 300 : "100%",
              // flexBasis: "40%",
              flexGrow: 0,
              flexShrink: 1,
            }}
          />
        ) : null}

        <Stack flexDirection="column" flexGrow={3} flexShrink={0} spacing={2}>
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
              <Icons.LinkIcon />
            </IconButton>
          </CardActions>
        </Stack>
      </Stack>
    </Card>
  );
};

export default LinkCard;
