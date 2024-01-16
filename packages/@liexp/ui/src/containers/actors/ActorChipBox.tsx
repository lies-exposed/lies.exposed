import { type UUID } from "io-ts-types/lib/UUID.js";
import * as React from "react";
import QueriesRenderer from "../../components/QueriesRenderer.js";
import {
  ActorChip,
  type ActorChipProps,
} from "../../components/actors/ActorChip.js";

type ActorChipBoxProps = ActorChipProps & {
  id: UUID;
};

const ActorChipBox = ({
  id,
  ...props
}: ActorChipBoxProps): JSX.Element | null => {
  return (
    <QueriesRenderer
      queries={(Q) => ({ actor: Q.Actor.get.useQuery({ id }) })}
      render={({ actor }) => {
        return <ActorChip {...props} actor={actor} />;
      }}
    />
  );
};

export default ActorChipBox;
