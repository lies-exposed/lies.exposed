import { type Actor } from "@liexp/shared/lib/io/http";
import { toColorHash } from "@liexp/shared/lib/utils/colors";
import * as React from "react";
import { Avatar } from "../Common/Avatar";
import { ChipCount, type ChipCountProps } from "../Common/ChipCount";

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
      avatar={<Avatar src={actor.avatar} />}
      color={toColorHash(actor.color)}
    />
  );
};
