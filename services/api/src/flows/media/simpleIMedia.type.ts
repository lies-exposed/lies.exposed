import { type MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { type MediaEntity } from "#entities/Media.entity.js";

export type SimpleMedia<T extends MediaType = MediaType> = Pick<
  MediaEntity,
  "id" | "location" | "thumbnail"
> & {
  type: T;
};
