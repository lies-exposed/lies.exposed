import { type APIRESTClient } from "@liexp/shared/lib/providers/api-rest.provider.js";
import { useContext } from "react";
import { JSONAPIProviderContext } from "../context/JSONAPIProviderContext.js";

export const useJSONClient = (): APIRESTClient => {
  const jsonClient = useContext(JSONAPIProviderContext);
  return jsonClient;
};
