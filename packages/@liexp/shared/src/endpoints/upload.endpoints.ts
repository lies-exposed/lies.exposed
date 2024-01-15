import * as t from "io-ts";
import { Endpoint } from "ts-endpoint";
import { ACTORS } from "../io/http/Actor.js";
import { GROUPS } from "../io/http/Group.js";
import { ValidContentType } from "../io/http/Media.js";

export const UploadResource = t.union(
  [
    ACTORS,
    GROUPS,
    t.literal("stories"),
    t.literal("media"),
    t.literal("projects"),
    t.literal("areas"),
  ],
  "UploadResource",
);

export type UploadResource = t.TypeOf<typeof UploadResource>;

export const GetSignedURL = Endpoint({
  Method: "POST",
  getPath: () => `/uploads/getSignedURL`,
  Input: {
    Body: t.strict({
      resource: UploadResource,
      resourceId: t.string,
      ContentType: ValidContentType,
      ContentLength: t.number,
    }),
  },
  Output: t.strict({ data: t.strict({ url: t.string }) }),
});
