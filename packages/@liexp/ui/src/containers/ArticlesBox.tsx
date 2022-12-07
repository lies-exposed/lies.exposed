import { Actor } from "@liexp/shared/io/http/Actor";
import * as React from "react";
import { GetListParams } from "react-admin";
import { ArticleList } from "../components/articles/ArticleList";
import QueriesRenderer from "../components/QueriesRenderer";
import { useActorsQuery } from "../state/queries/DiscreteQueries";

interface ActorsBoxProps {
  params: GetListParams;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  onItemClick: (item: Actor) => void;
}

const ArticlesBox = <D extends React.ElementType<any> = "ul">({
  params,
  displayFullName,
  style,
  itemStyle,
  onItemClick,
  ...props
}: ActorsBoxProps<D>): JSX.Element | null => {
  if (!params.filter.ids || params.filter.ids.length === 0) {
    return null;
  }

  return (
    <QueriesRenderer
      queries={{ actors: useActorsQuery(params, true) }}
      render={({ actors: { data: actors } }) => {
        return (
          <ArticleList
            {...props}
            displayFullName={displayFullName}
            style={style}
            itemStyle={itemStyle}
            actors={actors.map((a) => ({ ...a, selected: true }))}
            onActorClick={onItemClick}
          />
        );
      }}
    />
  );
};

export default ArticlesBox;
