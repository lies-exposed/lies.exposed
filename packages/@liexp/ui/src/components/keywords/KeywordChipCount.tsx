import { type Keyword } from "@liexp/shared/lib/io/http";
import { toColorHash } from "@liexp/shared/lib/utils/colors";
import * as React from "react";
import { ChipCount, type ChipCountProps } from "../Common/ChipCount";
import { Typography } from "../mui";

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
      avatar={
        <Typography
          variant="subtitle2"
          style={{ color: hashColor, paddingRight: 5 }}
        >{`#${keyword.tag}`}</Typography>
      }
      color={hashColor}
    />
  );
};
