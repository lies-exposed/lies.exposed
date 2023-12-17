import { useContext } from "react";
import { DataProviderContext } from "../context/DataProviderContext";
import { type APIRESTClient } from "../http";

export const useDataProvider = (): APIRESTClient => {
  const dataProvider = useContext(DataProviderContext);
  return dataProvider;
};
