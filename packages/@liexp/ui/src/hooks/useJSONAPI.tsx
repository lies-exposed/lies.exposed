import { type APIRESTClient } from "@ts-endpoint/react-admin";
import { useContext } from "react";
import { JSONAPIProviderContext } from "../context/JSONAPIProviderContext.js";

export const useJSONClient = (): APIRESTClient => {
  const jsonClient = useContext(JSONAPIProviderContext);
  return jsonClient;
};
