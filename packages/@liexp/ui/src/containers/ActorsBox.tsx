import { Actor } from "@liexp/shared/io/http/Actor";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as React from "react";
import { ErrorBox } from '../components/Common/ErrorBox';
import { LazyFullSizeLoader } from "../components/Common/FullSizeLoader";
import { ActorList } from '../components/lists/ActorList';
import { Queries } from "../providers/DataProvider";

const ActorsBox: React.FC<{
  params: any;
  onItemClick: (item: Actor) => void;
}> = ({ params, onItemClick }) => {
  return (
    <WithQueries
      queries={{ actors: Queries.Actor.getList }}
      params={{
        actors: params,
      }}
      render={QR.fold(
        LazyFullSizeLoader,
        ErrorBox,
        ({ actors: { data: actors } }) => {
          // eslint-disable-next-line react/jsx-key
          return (
            <ActorList
              actors={actors.map((a) => ({ ...a, selected: true }))}
              onActorClick={onItemClick}
            />
          );
        }
      )}
    />
  );
};

export default ActorsBox;
