import { Actor } from "@liexp/shared/io/http/Actor";
import * as React from "react";
import { GetListParams } from "react-admin";
import QueriesRenderer from "../components/QueriesRenderer";
import { ActorList } from "../components/lists/ActorList";
import { useActorsDiscreteQuery } from "../state/queries/DiscreteQueries";

const ActorsBox: React.FC<{
  params: GetListParams;
  style?: React.CSSProperties;
  onItemClick: (item: Actor) => void;
}> = ({ params, onItemClick, style }) => {
  
  if (!params.filter.ids || params.filter.ids.length === 0) {
    return null;
  }

  return (
    <QueriesRenderer
      queries={{ actors: useActorsDiscreteQuery(params) }}
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
