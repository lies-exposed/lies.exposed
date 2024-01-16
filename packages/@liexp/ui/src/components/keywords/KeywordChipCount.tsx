import { type Keyword } from "@liexp/shared/lib/io/http/index.js";
import { toColorHash } from "@liexp/shared/lib/utils/colors.js";
import * as React from "react";
import { ChipCount, type ChipCountProps } from "../Common/ChipCount.js";
import { KeywordChip } from "./KeywordChip.js";

interface KeywordChipCountProps
  extends Omit<ChipCountProps, "label" | "avatar" | "color"> {
  keyword: Keyword.Keyword;
}

export const KeywordChipCount: React.FC<KeywordChipCountProps> = ({
  keyword,
  ...props
}) => {
  const hashColor = toColorHash(keyword.color);
  return (
    <ChipCount
      {...props}
      avatar={<KeywordChip keyword={keyword} />}
      color={hashColor}
    />
  );
};
