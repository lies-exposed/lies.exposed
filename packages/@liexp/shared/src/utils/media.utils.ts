import { fp } from "@liexp/core/lib/fp/index.js";
import { Schema } from "effect";
import { type Option } from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import { type UploadResource } from "../endpoints/upload.endpoints.js";
import { UUID } from "../io/http/Common/UUID.js";
import * as Media from "../io/http/Media/index.js";
import { ResourcesNames } from "../io/http/ResourcesNames.js";

export const contentTypeFromFileExt = (c: string): Media.ValidContentType => {
  switch (c) {
    case "pdf":
      return Media.MediaType.members[6].Type;
    case "mp4":
      return Media.MediaType.members[5].Type;
    case "ogg":
      return Media.MediaType.members[4].Type;
    case "mp3":
      return Media.MediaType.members[3].Type;
    case "png":
      return Media.MediaType.members[2].Type;
    case "jpeg":
      return Media.MediaType.members[1].Type;
    case "jpg":
    default:
      return Media.MediaType.members[0].Type;
  }
};

export const fileExtFromContentType = (c: Media.ValidContentType): string => {
  switch (c) {
    case Media.MediaType.members[6].Type:
      return "pdf";
    case Media.MediaType.members[5].Type:
      return "mp4";
    case Media.MediaType.members[4].Type:
      return "ogg";
    case Media.MediaType.members[3].Type:
      return "mp3";
    case Media.MediaType.members[2].Type:
      return "png";
    case Media.MediaType.members[1].Type:
      return "jpeg";
    case Media.MediaType.members[0].Type:
      return "jpg";
  }
};

export const extensionFromURL = (u: string): string => {
  const [, ext] = pipe(u.split("."));
  if (!ext) {
    return "jpg";
  }
  return ext;
};

export const getResourceAndIdFromLocation = (
  u: string,
): Option<{ resource: string; id: UUID }> => {
  const [, resource, id] = pipe(u.split("/"));

  if (Schema.is(ResourcesNames)(resource) && Schema.is(UUID)(id)) {
    return fp.O.some({ resource, id });
  }

  return fp.O.none;
};

export const getMediaKeyFromLocation = (u: string): string => {
  const id = pipe(
    u.split("/"),
    fp.A.last,
    fp.O.alt(() => fp.O.some(u)),
    fp.O.map((file) => file.split(".")[0]),
    fp.O.getOrElse(() => u),
  );

  return id;
};

export const getMediaKey = (
  resource: UploadResource,
  id: string,
  fileName: string,
  contentType: Media.ValidContentType,
): string => {
  return `public/${resource}/${id}/${fileName}.${fileExtFromContentType(
    contentType,
  )}`;
};

export const getMediaThumbKey = (
  id: string,
  contentType: Media.ValidContentType,
  n: number | undefined = 1,
): string => getMediaKey("media", id, `${id}-thumb-${n}`, contentType);
