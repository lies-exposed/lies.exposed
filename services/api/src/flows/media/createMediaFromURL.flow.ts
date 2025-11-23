import { type MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { type UserEntity } from "@liexp/backend/lib/entities/User.entity.js";
import { checkMediaAccessibility } from "@liexp/backend/lib/flows/media/checkMediaAccessibility.flow.js";
import { MediaRepository } from "@liexp/backend/lib/services/entity-repository.service.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { parseURL } from "@liexp/shared/lib/helpers/media.helper.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type CreateMedia } from "@liexp/shared/lib/io/http/Media/Media.js";
import { type ServerContext } from "../../context/context.type.js";
import { type TEReader } from "#flows/flow.types.js";

/**
 * Creates a media entity in the database with an existing URL
 * Use this for external URLs that don't need to be uploaded to storage
 */
export const createMediaFromURLFlow = (
  input: CreateMedia,
  creator: UserEntity | null,
): TEReader<MediaEntity> => {
  const {
    id,
    location,
    type,
    label,
    description,
    extra,
    areas,
    keywords,
    links,
    events,
  } = input;

  return pipe(
    fp.RTE.Do,
    fp.RTE.bind("location", () => {
      return pipe(
        parseURL(location),
        fp.E.fold(
          () => location,
          (r) => r.location,
        ),
        fp.RTE.right,
      );
    }),
    fp.RTE.chainFirst(({ location }) =>
      checkMediaAccessibility<ServerContext>(location),
    ),
    fp.RTE.chain(({ location }) =>
      MediaRepository.save([
        {
          ...input,
          id: id ?? uuid(),
          type,
          location,
          label: label ?? null,
          description: description ?? label ?? null,
          creator: creator,
          extra: extra ?? null,
          areas: areas.map((id) => ({ id })),
          keywords: keywords.map((id) => ({ id })),
          links: links.map((id) => ({ id })),
          events: events.map((e) => ({
            id: e,
          })),
        },
      ]),
    ),
    fp.RTE.map((media) => media[0]),
    LoggerService.RTE.debug("Created media entity from URL: %O"),
  );
};
