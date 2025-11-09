import { type UUID } from "@liexp/shared/lib/io/http/Common";
import {
  type NetworkLink,
  type NetworkNode,
} from "@liexp/shared/lib/io/http/Network/Network.js";
import { Keyword } from "@liexp/shared/lib/io/http/index.js";

export type KeywordNetworkNodeProps = NetworkNode<{
  id: UUID;
  label: string;
  innerColor: string;
  outerColor: string;
  name: string;
  type: string;
  group: string;
  color: string;
}>;

export const toKeywordNodes = (
  groups: readonly Keyword.Keyword[],
  links: readonly NetworkLink[],
): KeywordNetworkNodeProps[] => {
  return groups.map((g) => ({
    data: {
      ...g,
      label: g.tag,
      innerColor: g.color,
      outerColor: g.color,
      name: g.tag,
      group: Keyword.KEYWORDS.literals[0],
      type: Keyword.KEYWORDS.literals[0],
      count: links.filter((kk) => kk.source === g.id || kk.target === g.id)
        .length,
    },
  }));
};
