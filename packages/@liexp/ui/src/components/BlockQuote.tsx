import * as React from "react";

export const BlockQuote: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <blockquote
      style={{
        borderLeft: 3,
        borderLeftColor: "red",
        borderLeftStyle: "solid",
        padding: 20,
        marginLeft: 0,
      }}
    >
      {children}
    </blockquote>
  );
};
