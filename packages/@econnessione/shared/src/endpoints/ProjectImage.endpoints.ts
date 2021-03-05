import { Endpoint } from "ts-endpoint";
import * as http from "../io/http";
import { GetListOutput } from "../io/http/Common/Output";
import { GetListQuery } from "./Query";

const ListProjectImageOutput = GetListOutput(
  http.ProjectImage.ProjectImage,
  "ListProjectImage"
);

export const List = Endpoint({
  Method: "GET",
  getPath: () => `/project/images`,
  Input: {
    Query: { ...GetListQuery.props },
  },
  Output: ListProjectImageOutput,
});
