import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { ValidContentType } from "../io/http/Media";

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
      ContentType: ValidContentType,
    }),
  },
  Output: t.strict({ data: t.strict({ url: t.string }) }),
});
