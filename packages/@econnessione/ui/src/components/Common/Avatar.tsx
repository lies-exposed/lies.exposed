import {
  AvatarProps as MUIAvatarProps,
  Avatar as MUIAvatar,
} from "@material-ui/core";
import { makeStyles, createStyles, Theme } from "@material-ui/core/styles";
import * as React from "react";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: "flex",
      "& > *": {
        margin: theme.spacing(1),
      },
    },
    xsmall: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    small: {
      width: theme.spacing(4),
      height: theme.spacing(4),
    },
    medium: {
      width: theme.spacing(6),
      height: theme.spacing(6),
    },
    large: {
      width: theme.spacing(12),
      height: theme.spacing(12),
    },
    xlarge: {
      width: theme.spacing(16),
      height: theme.spacing(16),
    },
  })
);

export type AvatarSize = "xsmall" | "small" | "medium" | "large" | "xlarge";

interface AvatarProps extends MUIAvatarProps {
  size?: AvatarSize;
}

export const Avatar: React.FC<AvatarProps> = ({ size = "small", ...props }) => {
  const classes = useStyles();

  return <MUIAvatar className={classes[size]} {...props} />;
};
