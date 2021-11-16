import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { MediaType } from "../io/http/Media";

export const GetSignedURL = Endpoint({
  Method: "POST",
  getPath: () => `/uploads/getSignedURL`,
  Input: {
    Body: t.strict({
      resource: t.union([
        t.literal("actors"),
        t.literal("articles"),
        t.literal("groups"),
        t.literal("media"),
        t.literal("projects"),
        t.literal("areas"),
      ]),
      resourceId: t.string,
      ContentType: MediaType,
    }),
  },
  Output: t.strict({ data: t.strict({ url: t.string }) }),
});

// export const uploads = ResourceEndpoints({
//   Get: GetSignedURL,
//   List:
// });
