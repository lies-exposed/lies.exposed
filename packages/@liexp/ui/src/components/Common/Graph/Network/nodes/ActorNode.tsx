import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type NetworkLink,
  type NetworkNode,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { Actor } from "@liexp/shared/lib/io/http/index.js";

export type ActorNetworkNodeProps = NetworkNode<{
  id: UUID;
  label: string;
  innerColor: string;
  outerColor: string;
  name: string;
  type: string;
  group: string;
  color: string;
}>;

export const toActorNodes = (
  actors: readonly Actor.Actor[],
  links: readonly NetworkLink[],
): ActorNetworkNodeProps[] => {
  return actors.map((a) => ({
    data: {
      ...a,
      label: a.fullName,
      innerColor: a.color,
      outerColor: a.color,
      name: a.fullName,
      group: Actor.ACTORS.literals[0],
      type: Actor.ACTORS.literals[0],
      count: links.filter((kk) => kk.source === a.id || kk.target === a.id)
        .length,
    },
  }));
};
