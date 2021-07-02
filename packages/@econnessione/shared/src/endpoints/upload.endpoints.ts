import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";

export const GetSignedURL = Endpoint({
  Method: "POST",
  getPath: () => `/uploads/getSignedURL`,
  Input: {
    Body: t.strict({
      resource: t.union([
        t.literal("actors"),
        t.literal("groups"),
        t.literal("events"),
        t.literal("projects"),
        t.literal("areas"),
      ]),
      resourceId: t.string,
      ContentType: t.string,
    }),
  },
  Output: t.strict({ data: t.string }),
});

// export const uploads = ResourceEndpoints({
//   Get: GetSignedURL,
//   List: 
// });
