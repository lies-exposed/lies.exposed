import { clsx } from "clsx";
import * as React from "react";
import { styled } from "../../theme/index.js";
import {
  Avatar as MUIAvatar,
  type AvatarProps as MUIAvatarProps,
} from "../mui/index.js";

const PREFIX = "Avatar";

const classes = {
  root: `${PREFIX}-root`,
  xsmall: `${PREFIX}-xsmall`,
  small: `${PREFIX}-small`,
  medium: `${PREFIX}-medium`,
  large: `${PREFIX}-large`,
  xlarge: `${PREFIX}-xlarge`,
};

const StyledMUIAvatar = styled(MUIAvatar)(({ theme }) => ({
  [`& .${classes.root}`]: {
    display: "flex",
    "& .MuiAvatar-img": {
      objectFit: (props: any) => props.fit,
    },
  },

  [`&.${classes?.xsmall}`]: {
    width: theme.spacing(3),
    height: theme.spacing(3),
  },

  [`&.${classes.small}`]: {
    width: theme.spacing(4),
    height: theme.spacing(4),
  },

  [`&.${classes.medium}`]: {
    width: theme.spacing(6),
    height: theme.spacing(6),
  },

  [`&.${classes.large}`]: {
    width: theme.spacing(12),
    height: theme.spacing(12),
  },
  [`&.${classes.xlarge}`]: {
    width: theme.spacing(16),
    height: theme.spacing(16),
  },
}));

export type AvatarSize = "xsmall" | "small" | "medium" | "large" | "xlarge";

export interface AvatarProps extends MUIAvatarProps {
  size?: AvatarSize;
  fit?: React.CSSProperties["objectFit"];
}

export const Avatar: React.FC<AvatarProps> = ({
  size = "small",
  fit = "cover",
  ...props
}) => {
  return (
    <StyledMUIAvatar
      {...props}
      className={clsx(classes.root, classes[size])}
      slotProps={{
        img: {
          decoding: "async",
          style: { objectFit: fit },
        },
      }}
    />
  );
};
