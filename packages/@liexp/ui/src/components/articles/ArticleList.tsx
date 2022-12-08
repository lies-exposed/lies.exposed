import { Article } from "@liexp/shared/io/http/Article";
import * as React from "react";
import { Grid } from "../mui";
import { ArticleCard } from "./ArticleCard";

interface ArticleListProps {
  articles: Article[];
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  onClick: (a: Article) => void;
}

export const ArticleList: React.FC<ArticleListProps> = ({
  articles,
  style,
  itemStyle,
  onClick,
}) => {
  return (
    <Grid container style={style} spacing={2}>
      {articles.map((a) => (
        <Grid key={a.id} item xs={6}>
          <ArticleCard
            key={a.id}
            article={a}
            onClick={onClick}
            style={itemStyle}
          />
        </Grid>
      ))}
    </Grid>
  );
};
