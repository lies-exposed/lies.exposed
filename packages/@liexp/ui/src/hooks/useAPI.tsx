import { API } from "@liexp/shared/lib/providers/api/api.provider.js";
import React from "react";
import { useDataProvider } from "./useDataProvider.js";

export const useAPI = (): API => {
  const dataProvider = useDataProvider();
  return React.useMemo(() => {
    return API(dataProvider.client);
  }, []);
};
