import { type APIRESTClient } from "@ts-endpoint/react-admin";
import { useContext } from "react";
import { DataProviderContext } from "../context/DataProviderContext.js";
/**
 * Provide context with @ts-endpoint/react-admin client
 *
 *
 */
export const useDataProvider = (): APIRESTClient => {
  const dataProvider = useContext(DataProviderContext);
  return dataProvider;
};
