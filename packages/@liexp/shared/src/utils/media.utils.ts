import { fp } from "@liexp/core/lib/fp/index.js";
import { type Option } from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID.js";
import { type UploadResource } from "../endpoints/upload.endpoints.js";
import * as Media from "../io/http/Media.js";

export const contentTypeFromFileExt = (c: string): Media.ValidContentType => {
  switch (c) {
    case "pdf":
      return Media.MediaType.types[6].value;
    case "mp4":
      return Media.MediaType.types[5].value;
    case "ogg":
      return Media.MediaType.types[4].value;
    case "mp3":
      return Media.MediaType.types[3].value;
    case "png":
      return Media.MediaType.types[2].value;
    case "jpeg":
      return Media.MediaType.types[1].value;
    case "jpg":
    default:
      return Media.MediaType.types[0].value;
  }
};

export const fileExtFromContentType = (c: Media.ValidContentType): string => {
  switch (c) {
    case Media.MediaType.types[6].value:
      return "pdf";
    case Media.MediaType.types[5].value:
      return "mp4";
    case Media.MediaType.types[4].value:
      return "ogg";
    case Media.MediaType.types[3].value:
      return "mp3";
    case Media.MediaType.types[2].value:
      return "png";
    case Media.MediaType.types[1].value:
      return "jpeg";
    case Media.MediaType.types[0].value:
      return "jpg";
  }
};

export const getResourceAndIdFromLocation = (
  u: string,
): Option<{ resource: string; id: string }> => {
  const [, resource, id] = pipe(u.split("/"));

  if (resource && UUID.is(id)) {
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
): string => getMediaKey("media", id, `${id}-thumb`, contentType);

export const ensureHTTPS = (url: string): string => {
  if (url.startsWith("https://") || url.startsWith("http://")) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  return `https://${url}`;
};
