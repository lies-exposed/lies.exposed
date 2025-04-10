import { Endpoint } from "@ts-endpoint/core";
import { Schema } from "effect";
import { ACTORS } from "../io/http/Actor.js";
import { GROUPS } from "../io/http/Group.js";
import { ValidContentType } from "../io/http/Media/MediaType.js";

export const UploadResource = Schema.Union(
  ACTORS,
  GROUPS,
  Schema.Literal("stories"),
  Schema.Literal("media"),
  Schema.Literal("projects"),
  Schema.Literal("areas"),
).annotations({ title: "UploadResource" });

export type UploadResource = typeof UploadResource.Type;

export const GetSignedURL = Endpoint({
  Method: "POST",
  getPath: () => `/uploads/getSignedURL`,
  Input: {
    Body: Schema.Struct({
      resource: UploadResource,
      resourceId: Schema.String,
      ContentType: ValidContentType,
      ContentLength: Schema.Number,
    }),
  },
  Output: Schema.Struct({ data: Schema.Struct({ url: Schema.String }) }),
});
