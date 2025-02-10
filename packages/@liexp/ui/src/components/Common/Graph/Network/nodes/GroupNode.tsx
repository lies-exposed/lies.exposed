import {
  type NetworkLink,
  type NetworkNode,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { Group } from "@liexp/shared/lib/io/http/index.js";
import { type UUID } from "io-ts-types";

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
      group: Group.GROUPS.value,
      type: Group.GROUPS.value,
      count: links.filter((kk) => kk.source === g.id || kk.target === g.id)
        .length,
    },
  }));
};
