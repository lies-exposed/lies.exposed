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
    small: {
      width: theme.spacing(3),
      height: theme.spacing(3),
    },
    large: {
      width: theme.spacing(18),
      height: theme.spacing(18),
    },
  })
);

export type AvatarSize = "small" | "large";

interface AvatarProps extends MUIAvatarProps {
  size?: AvatarSize;
}

export const Avatar: React.FC<AvatarProps> = ({ size = "small", ...props }) => {
  const classes = useStyles();

  return <MUIAvatar className={classes[size]} {...props} />;
};
