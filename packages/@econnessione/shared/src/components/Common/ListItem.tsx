import { Typography } from "@material-ui/core";
import * as React from "react";

export const ListItem: React.FC<any> = ({ children, ...props }) => {
  return (
    <li>
      <Typography variant="body1">{children}</Typography>
    </li>
  );
};
