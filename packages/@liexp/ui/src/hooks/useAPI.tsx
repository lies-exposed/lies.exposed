import {
  GetAPIProvider,
  type API,
} from "@liexp/shared/lib/providers/api/api.provider.js";
import * as React from "react";
import { useDataProvider } from "./useDataProvider.js";

export const useAPI = (): API => {
  const dataProvider = useDataProvider();
  return React.useMemo(() => {
    return GetAPIProvider(dataProvider.client);
  }, []);
};
