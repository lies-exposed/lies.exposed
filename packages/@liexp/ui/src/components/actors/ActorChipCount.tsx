import { type Actor } from "@liexp/shared/lib/io/http/index.js";
import { toColorHash } from "@liexp/shared/lib/utils/colors.js";
import * as React from "react";
import { Avatar } from "../Common/Avatar.js";
import { ChipCount, type ChipCountProps } from "../Common/ChipCount.js";

interface ActorChipCountProps
  extends Omit<ChipCountProps, "label" | "avatar" | "color"> {
  actor: Actor.Actor;
}

export const ActorChipCount: React.FC<ActorChipCountProps> = ({
  actor,
  ...props
}) => {
  return (
    <ChipCount
      {...props}
      avatar={<Avatar src={actor.avatar?.thumbnail} />}
      color={toColorHash(actor.color)}
    />
  );
};
