import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { fetchMedia } from "@liexp/backend/lib/flows/media/fetchMedia.flow.js";
import { uploadAndCreate } from "@liexp/backend/lib/flows/media/uploadAndCreate.flow.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { type ServerContext } from "../../context/context.type.js";
import { toControllerError } from "../../io/ControllerError.js";
import { type TEReader } from "#flows/flow.types.js";

interface UploadMediaFromURLInput {
  id: UUID;
  url: URL;
  type: MediaType;
  label: string;
  description?: string;
}

/**
 * Downloads media from a URL and uploads it to S3 storage, then creates a media entity
 */
export const uploadMediaFromURLFlow = (
  input: UploadMediaFromURLInput,
): TEReader<MediaEntity> => {
  const { id, url, type, label, description, ...rest } = input;

  return pipe(
    // Download the file from URL
    fetchMedia<ServerContext>(url),
    LoggerService.RTE.debug("Downloaded media buffer"),
    fp.RTE.mapLeft(toControllerError),
    fp.RTE.chain((steam) =>
      uploadAndCreate<ServerContext>(
        {
          thumbnail: undefined,
          extra: undefined,
          events: [],
          links: [],
          keywords: [],
          areas: [],
          id,
          location: url,
          type,
          label,
          description,
          ...rest,
        },
        { Body: steam, ContentType: type },
        id,
        false,
      ),
    ),
    LoggerService.RTE.debug("Created media entity: %O"),
  );
};
