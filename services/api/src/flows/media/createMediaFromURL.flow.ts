import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { pipe, fp } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { type UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type MediaType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { type TEReader } from "#flows/flow.types.js";

interface CreateMediaFromURLInput {
  id: UUID;
  location: URL;
  type: MediaType;
  label: string;
  description?: string;
}

/**
 * Creates a media entity in the database with an existing URL
 * Use this for external URLs that don't need to be uploaded to storage
 */
export const createMediaFromURLFlow =
  (input: CreateMediaFromURLInput): TEReader<MediaEntity> =>
  (ctx) => {
    const { id, location, type, label, description } = input;

    return pipe(
      ctx.db.save(MediaEntity, [
        {
          id,
          location,
          type,
          label,
          description: description ?? label ?? null,
          thumbnail: null,
          extra: null,
          events: [],
          links: [],
          keywords: [],
          areas: [],
        },
      ]),
      fp.TE.map((media) => media[0]),
      LoggerService.TE.debug(ctx, "Created media entity from URL: %O"),
    );
  };
