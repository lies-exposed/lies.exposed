import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";

export const GetGraph = Endpoint({
  Method: "GET",
  getPath: ({ id }) => `/graphs/${id}`,
  Input: {
    Params: t.type({ id: t.string }),
  },
  Output: t.strict({ data: t.unknown }),
});
