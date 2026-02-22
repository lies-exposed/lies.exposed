import { type http } from "@liexp/io/lib/index.js";
import { formatDate, parseISO } from "@liexp/shared/lib/utils/date.utils.js";
import * as React from "react";
import EllipsesContent from "../Common/EllipsedContent.js";
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
import * as styles from "./LinkCard.styles.js";

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
      sx={styles.getCardContainerSx(variant)}
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
            sx={styles.getMediaImageSx(variant)}
          />
        ) : null}

        <Stack sx={styles.contentStackSx}>
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
            {link.description ? (
              <EllipsesContent
                text={link.description}
                variant="body2"
                maxLine={4}
              />
            ) : null}
          </CardContent>
          <CardActions sx={styles.cardActionsSx} disableSpacing>
            <IconButton
              sx={styles.openButtonSx}
              color="inherit"
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
