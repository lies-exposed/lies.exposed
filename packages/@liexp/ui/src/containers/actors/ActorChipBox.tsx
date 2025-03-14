import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import * as React from "react";
import QueriesRenderer from "../../components/QueriesRenderer.js";
import {
  ActorChip,
  type ActorChipProps,
} from "../../components/actors/ActorChip.js";

type ActorChipBoxProps = Omit<ActorChipProps, "actor"> & {
  id: UUID;
};

const ActorChipBox = ({
  id,
  ...props
}: ActorChipBoxProps): React.ReactNode | null => {
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
