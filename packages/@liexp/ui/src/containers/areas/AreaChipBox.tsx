import { type UUID } from "io-ts-types/lib/UUID.js";
import * as React from "react";
import QueriesRenderer from "../../components/QueriesRenderer.js";
import {
  AreaChip,
  type AreaChipProps,
} from "../../components/area/AreaChip.js";

type AreaChipBoxProps = Omit<AreaChipProps, "area"> & {
  id: UUID;
};

export const AreaChipBox = ({
  id,
  ...props
}: AreaChipBoxProps): React.ReactNode | null => {
  return (
    <QueriesRenderer
      queries={(Q) => ({ area: Q.Area.get.useQuery({ id }) })}
      render={({ area }) => {
        return <AreaChip {...props} area={area} />;
      }}
    />
  );
};
