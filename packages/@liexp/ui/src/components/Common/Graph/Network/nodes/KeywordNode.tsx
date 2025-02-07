import { type NetworkLink } from "@liexp/shared/lib/io/http/Network/Network.js";
import { type NetworkNode } from "@liexp/shared/lib/io/http/Network/Network.js";
import { Keyword } from "@liexp/shared/lib/io/http/index.js";
import { type UUID } from "io-ts-types";

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
  groups: Keyword.Keyword[],
  links: NetworkLink[],
): KeywordNetworkNodeProps[] => {
  return groups.map((g) => ({
    data: {
      ...g,
      label: g.tag,
      innerColor: g.color,
      outerColor: g.color,
      name: g.tag,
      group: Keyword.KEYWORDS.value,
      type: Keyword.KEYWORDS.value,
      count: links.filter((kk) => kk.source === g.id || kk.target === g.id)
        .length,
    },
  }));
};
