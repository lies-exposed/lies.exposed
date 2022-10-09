import { ValidContentType } from "../endpoints/upload.endpoints";
import * as Media from "../io/http/Media";

export const fileExtFromContentType = (c: ValidContentType): string => {
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
