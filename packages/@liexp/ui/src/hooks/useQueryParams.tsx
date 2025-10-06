import querystring from "query-string";
import { useLocation } from "react-router";
import { queryStringOpts } from "../utils/routes.utils.js";

export const useQueryParams = <
  _T extends Record<string, string>,
>(): querystring.ParsedQuery<string | boolean | number> => {
  const l = useLocation();
  return querystring.parse(l.search, queryStringOpts);
};
