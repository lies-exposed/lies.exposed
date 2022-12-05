import { Actor } from "@liexp/shared/io/http/Actor";
import * as React from "react";
import { GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { ActorList, ActorListProps } from "../components/lists/ActorList";
import { useActorsQuery } from "../state/queries/DiscreteQueries";

type ActorsBoxProps<D extends React.ElementType<any> = "ul"> = Omit<
  ActorListProps<D>,
  "actors" | "onActorClick"
> & {
  params: GetListParams;
  displayFullName?: boolean;
  style?: React.CSSProperties;
  itemStyle?: React.CSSProperties;
  onItemClick: (item: Actor) => void;
};

const ActorsBox = <D extends React.ElementType<any> = "ul">({
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
          <ActorList
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

export default ActorsBox;
