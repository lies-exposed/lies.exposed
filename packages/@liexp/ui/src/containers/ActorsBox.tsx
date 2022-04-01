import { Actor } from "@liexp/shared/io/http/Actor";
import * as React from "react";
import { GetListParams } from 'react-admin';
import QueriesRenderer from "../components/QueriesRenderer";
import { ActorList } from "../components/lists/ActorList";
import { useActorsQuery } from "../state/queries/DiscreteQueries";

const ActorsBox: React.FC<{
  params: GetListParams;
  style?: React.CSSProperties;
  onItemClick: (item: Actor) => void;
}> = ({ params, onItemClick, style }) => {
  return (
    <QueriesRenderer
      queries={{ actors: useActorsQuery(params) }}
      render={({ actors: { data: actors } }) => {
        return (
          <ActorList
            style={style}
            actors={actors.map((a) => ({ ...a, selected: true }))}
            onActorClick={onItemClick}
          />
        );
      }}
    />
  );
};

export default ActorsBox;
