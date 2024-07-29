import {
  type NetworkLink,
  type NetworkNode,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { Actor } from "@liexp/shared/lib/io/http/index.js";

export type ActorNetworkNodeProps = NetworkNode<{
  id: string;
  label: string;
  innerColor: string;
  outerColor: string;
  name: string;
  type: string;
  group: string;
  color: string;
}>;

export const toActorNodes = (
  actors: Actor.Actor[],
  links: NetworkLink[],
): ActorNetworkNodeProps[] => {
  return actors.map((a) => ({
    data: {
      ...a,
      label: a.fullName,
      innerColor: a.color,
      outerColor: a.color,
      name: a.fullName,
      group: Actor.ACTORS.value,
      type: Actor.ACTORS.value,
      count: links.filter((kk) => kk.source === a.id || kk.target === a.id)
        .length,
    },
  }));
};
