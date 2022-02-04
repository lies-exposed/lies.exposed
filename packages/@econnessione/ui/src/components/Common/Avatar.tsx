import {
  AvatarProps as MUIAvatarProps,
  Avatar as MUIAvatar,
} from "@material-ui/core";
import { makeStyles, createStyles } from "@material-ui/core/styles";
import * as React from "react";
import { ECOTheme } from "../../theme/index";

const useStyles = makeStyles<
  ECOTheme,
  { fit: React.CSSProperties["objectFit"] }
>((theme) =>
  createStyles({
    root: {
      display: "flex",
      "& .MuiAvatar-img": {
        objectFit: (props) => props.fit,
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
  fit?: React.CSSProperties["objectFit"];
}

export const Avatar: React.FC<AvatarProps> = ({
  size = "small",
  fit = "cover",
  ...props
}) => {
  const classes = useStyles({ fit });

  return (
    <MUIAvatar
      className={`${classes.root} ${classes[size]}`}
      imgProps={{
        decoding: "async",
      }}
      {...props}
    />
  );
};
