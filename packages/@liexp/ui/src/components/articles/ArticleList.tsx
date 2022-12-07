import { Article } from "@liexp/shared/io/http/Article";
import * as React from "react";
import { Grid } from "../mui";
import { ArticleCard } from "./ArticleCard";

interface ArticleListProps {
  articles: Article[];
  onClick: (a: Article) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  onClick,
}) => {
  return (
    <Grid container>
      {articles.map((a) => (
        <Grid key={a.id} item md={3}>
          <ArticleCard key={a.id} article={a} onClick={onClick} />
        </Grid>
      ))}
    </Grid>
  );
};
