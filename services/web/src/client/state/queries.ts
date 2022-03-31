import { QueryClient } from "react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      notifyOnChangeProps: ["isLoading", "isError", "data", "error"],
    },
  },
});
