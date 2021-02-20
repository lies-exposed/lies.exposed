import * as React from "react";

export const ListItem: React.FC<any> = ({ children, ...props }) => {
  return <li>{children}</li>;
};
