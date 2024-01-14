import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { useContext } from "react";
import { DataProviderContext } from "../context/DataProviderContext.js";

export const useDataProvider = (): APIRESTClient => {
  const dataProvider = useContext(DataProviderContext);
  return dataProvider;
};
