import { type UUID } from "io-ts-types/lib/UUID";
import * as React from "react";
import QueriesRenderer from "../../components/QueriesRenderer";
import { ActorChip, type ActorChipProps } from "../../components/actors/ActorChip";
import { useActorQuery } from "../../state/queries/DiscreteQueries";

type ActorChipBoxProps = ActorChipProps & {
  id: UUID;
};

const ActorChipBox = ({ id, ...props }: ActorChipBoxProps): JSX.Element | null => {
  return (
    <QueriesRenderer
      queries={{ actor: useActorQuery({ id }) }}
      render={({ actor }) => {
        return <ActorChip {...props} actor={actor} />;
      }}
    />
  );
};

export default ActorChipBox;
