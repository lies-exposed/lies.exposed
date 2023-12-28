import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider";
import { useContext } from "react";
import { DataProviderContext } from "../context/DataProviderContext";

export const useDataProvider = (): APIRESTClient => {
  const dataProvider = useContext(DataProviderContext);
  return dataProvider;
};
