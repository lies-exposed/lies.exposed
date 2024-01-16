import * as React from "react";
import { Typography } from "../mui/index.js";

export const ListItem: React.FC<any> = ({ children, ...props }) => {
  return (
    <li>
      <Typography variant="body1">{children}</Typography>
    </li>
  );
};
