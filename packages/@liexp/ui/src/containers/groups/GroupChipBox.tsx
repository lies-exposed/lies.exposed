import { type UUID } from "io-ts-types/lib/UUID.js";
import * as React from "react";
import QueriesRenderer from "../../components/QueriesRenderer.js";
import {
  GroupChip,
  type GroupChipProps,
} from "../../components/groups/GroupChip.js";

type GroupChipBoxProps = Omit<GroupChipProps, "group"> & {
  id: UUID;
};

const GroupChipBox = ({
  id,
  ...props
}: GroupChipBoxProps): React.ReactNode | null => {
  return (
    <QueriesRenderer
      queries={(Q) => ({ group: Q.Group.get.useQuery({ id }) })}
      render={({ group }) => {
        return <GroupChip {...props} group={group} />;
      }}
    />
  );
};

export default GroupChipBox;
