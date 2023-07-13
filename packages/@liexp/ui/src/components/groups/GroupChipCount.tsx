import { type Group } from "@liexp/shared/lib/io/http";
import { toColorHash } from "@liexp/shared/lib/utils/colors";
import * as React from "react";
import { Avatar } from "../Common/Avatar";
import { ChipCount, type ChipCountProps } from "../Common/ChipCount";

interface GroupChipCountProps
  extends Omit<ChipCountProps, "label" | "avatar" | "color"> {
  group: Group.Group;
}

export const GroupChipCount: React.FC<GroupChipCountProps> = ({
  group,
  ...props
}) => {
  return (
    <ChipCount
      {...props}
      avatar={<Avatar src={group.avatar} />}
      color={toColorHash(group.color)}
    />
  );
};
