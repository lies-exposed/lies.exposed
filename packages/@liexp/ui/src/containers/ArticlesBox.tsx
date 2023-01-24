import { type Article } from "@liexp/shared/io/http/Article";
import * as React from "react";
import { type GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { ArticleList } from "../components/articles/ArticleList";
import { useArticlesQuery } from "../state/queries/DiscreteQueries";

interface ActorsBoxProps {
  params: GetListParams;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  onItemClick: (item: Article) => void;
}

const ArticlesBox = ({
  params,
  style,
  itemStyle,
  onItemClick,
  ...props
}: ActorsBoxProps): JSX.Element | null => {
  return (
    <QueriesRenderer
      queries={{ articles: useArticlesQuery(params, false) }}
      render={({ articles: { data: articles } }) => {
        return (
          <ArticleList
            {...props}
            style={style}
            itemStyle={{...itemStyle }}
            articles={articles}
            onClick={onItemClick}
          />
        );
      }}
    />
  );
};

export default ArticlesBox;
