import { Article } from "@liexp/shared/io/http/Article";
import { Button, Card, CardActionArea, CardActions, CardHeader, CardMedia } from "../mui";
import * as React from "react";
import * as t from "io-ts";
import { formatDate } from "@liexp/shared/utils/date";
import { parseISO } from "date-fns";

interface ArticleCardProps {
  article: Article;
  onClick: (a: Article) => void;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  article: a,
  onClick,
}) => {
  return (
    <Card>
      <CardHeader
        title={a.title}
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
