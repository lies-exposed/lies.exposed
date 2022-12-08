import { Article } from "@liexp/shared/io/http/Article";
import { formatDate } from "@liexp/shared/utils/date";
import { parseISO } from "date-fns";
import * as t from "io-ts";
import * as React from "react";
import {
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardHeader,
  CardMedia,
} from "../mui";

interface ArticleCardProps {
  article: Article;
  style?: React.CSSProperties;
  onClick: (a: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article: a,
  style,
  onClick,
}) => {
  return (
    <Card style={style}>
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
              t.string.is(a.createdAt) ? parseISO(a.createdAt) : a.createdAt
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
      <CardActions>
        <Button
          size="small"
          color="primary"
          onClick={() => {
            onClick(a);
          }}
        >
          Leggi
        </Button>
      </CardActions>
    </Card>
  );
};
