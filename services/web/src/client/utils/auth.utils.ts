import * as React from "react";

export const useHasAuth = (): string | null => {
  return React.useMemo(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth");
    }
    return null;
  }, [typeof window]);
};
