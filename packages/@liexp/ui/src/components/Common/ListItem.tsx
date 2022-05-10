import { Typography } from "@mui/material";
import * as React from "react";

export const ListItem: React.FC<any> = ({ children, ...props }) => {
  return (
    <li>
      <Typography variant="body1">{children}</Typography>
    </li>
  );
};
