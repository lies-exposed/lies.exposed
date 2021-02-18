import { themedUseStyletron } from "@theme/CustomTheme";
import * as React from "react";

export const BlockQuote: React.FC = ({ children }) => {
  const [, $theme] = themedUseStyletron();
  return (
    <blockquote
      style={{
        borderLeft: 3,
        borderLeftColor: $theme.colors.red,
        borderLeftStyle: "solid",
        padding: 20,
        marginLeft: 0,
      }}
    >
      {children}
    </blockquote>
  );
};
