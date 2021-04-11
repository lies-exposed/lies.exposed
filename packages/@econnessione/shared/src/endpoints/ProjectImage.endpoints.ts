import { Endpoint } from "ts-endpoint";
import * as http from "../io/http";
import { ListOutput } from "../io/http/Common/Output";
import { GetListQuery } from "../io/http/Query";

const ListProjectImageOutput = ListOutput(
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
