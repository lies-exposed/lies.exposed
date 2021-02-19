import { BlockProps } from "baseui/block";
import * as React from "react";

export const ListItem: React.FC<BlockProps> = ({ children, ...props }) => {
  return <li>{children}</li>;
};
