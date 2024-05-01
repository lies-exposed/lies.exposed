import { type Keyword } from "@liexp/shared/lib/io/http/index.js";
import { toColorHash } from "@liexp/shared/lib/utils/colors.js";
import * as React from "react";
import { Typography, type TypographyProps } from "../mui/index.js";

export interface KeywordChipProps
  extends Omit<TypographyProps, "variant" | "onClick"> {
  keyword: Keyword.Keyword;
  onClick?: (k: Keyword.Keyword) => void;
}

export const KeywordChip: React.FC<KeywordChipProps> = ({
  keyword: t,
  onClick,
  style,
  ...props
}) => {
  return (
    <Typography
      {...props}
      key={t.id}
      variant="body2"
      style={{
        ...style,
        marginRight: 10,
        borderColor: toColorHash(t.color),
        color: toColorHash(t.color),
        fontWeight: 700,
        display: "inline-block",
        cursor: "pointer",
      }}
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          e.stopPropagation();
          onClick(t);
        }
      }}
    >
      #{t.tag}
    </Typography>
  );
};
