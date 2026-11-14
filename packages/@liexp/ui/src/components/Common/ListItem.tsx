import * as React from "react";
import { Typography } from "../mui/index.js";

export interface ListItemOwnProps {
  children?: React.ReactNode;
}

export const ListItem: React.FC<ListItemOwnProps> = ({
  children,
  ..._props
}) => {
  return (
    <li>
      <Typography variant="body1">{children}</Typography>
    </li>
  );
};
