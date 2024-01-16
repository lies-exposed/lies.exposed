import { type Story } from "@liexp/shared/lib/io/http/Story.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { parseISO } from "date-fns";
import * as t from "io-ts";
import * as React from "react";
import { Card, CardActionArea, CardHeader, CardMedia } from "../mui/index.js";

interface StoryCardProps {
  article: Story;
  style?: React.CSSProperties;
  onClick: (a: Story) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  article: a,
  style,
  onClick,
}) => {
  return (
    <Card
      style={style}
      onClick={() => {
        onClick(a);
      }}
    >
      <CardHeader
        title={
          <span
            style={{
              height: 65,
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "block",
            }}
          >
            {a.title}
          </span>
        }
        subheader={
          <p style={{ fontSize: 11 }}>
            {formatDate(
              t.string.is(a.createdAt) ? parseISO(a.createdAt) : a.createdAt,
            )}
          </p>
        }
      />
      <CardActionArea>
        {a.featuredImage ? (
          <CardMedia
            component="img"
            alt={a.featuredImage.description}
            height="140"
            image={a.featuredImage.location}
            title={a.featuredImage.description}
          />
        ) : null}
      </CardActionArea>
    </Card>
  );
};
