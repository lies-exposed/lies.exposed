export const useHasAuth = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("auth");
  }

  return null;
};
