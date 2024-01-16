import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme/index.js";
import { Box, type BoxProps, Typography } from "../mui/index.js";

const StyledChip = styled(Box)<{ _color: string }>(
  ({ theme, _color: color }) => ({
    display: "flex",
    flexDirection: "row",
    borderRadius: theme.spacing(2),
    borderWidth: 2,
    borderColor: "transparent",
    borderStyle: "solid",
    alignItems: "center",
    justifyItems: "center",
    cursor: "pointer",
    [`& .selected`]: {},
    [`&:hover`]: {
      borderColor: color,
    },
    ".avatar": {
      background: "white",
      borderRadius: theme.spacing(2),
    },
    ".count": {
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(1),
    },
  }),
);

export interface ChipCountProps extends Omit<BoxProps, "color"> {
  count: number;
  color: string;
  avatar: React.ReactNode;
  selected?: boolean;
}

export const ChipCount: React.FC<ChipCountProps> = ({
  count,
  color,
  selected = false,
  avatar,
  ...props
}) => {
  return (
    <StyledChip
      {...props}
      {...({ _color: color } as any)}
      className={clsx({ selected })}
    >
      <Box className="avatar">{avatar}</Box>
      <Typography className="count" variant="caption">
        {count}
      </Typography>
    </StyledChip>
  );
};
