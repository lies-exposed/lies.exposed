import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
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
      render={({ area: { data: area } }) => {
        return <AreaChip {...props} area={area} />;
      }}
    />
  );
};
