import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import {
  type NetworkLink,
  type NetworkNode,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { Group } from "@liexp/shared/lib/io/http/index.js";

export type GroupNetworkNodeProps = NetworkNode<{
  id: UUID;
  label: string;
  innerColor: string;
  outerColor: string;
  name: string;
  type: string;
  group: string;
  color: string;
}>;

export const toGroupNodes = (
  groups: Group.Group[],
  links: NetworkLink[],
): GroupNetworkNodeProps[] => {
  return groups.map((g) => ({
    data: {
      ...g,
      label: g.name,
      innerColor: g.color,
      outerColor: g.color,
      name: g.name,
      group: Group.GROUPS.Type,
      type: Group.GROUPS.Type,
      count: links.filter((kk) => kk.source === g.id || kk.target === g.id)
        .length,
    },
  }));
};
