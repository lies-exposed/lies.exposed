import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { MediaType } from "../io/http/Media";

export const ValidContentType = t.union([
  MediaType.types[0],
  MediaType.types[1],
  MediaType.types[2],
  MediaType.types[3],
  MediaType.types[4]
])
export type ValidContentType = t.TypeOf<typeof ValidContentType>

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
