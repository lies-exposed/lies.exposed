import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { type Option } from "fp-ts/lib/Option.js";
import { type Metadata } from "page-metadata-parser";
import { MediaEntity } from "#entities/Media.entity.js";
import { type UserEntity } from "#entities/User.entity.js";
import { type TEFlow } from "#flows/flow.types.js";
import { type ControllerError } from "#io/ControllerError.js";

export const findOneByLocationOrElse: TEFlow<
  [Partial<Metadata>, (m: string) => Partial<MediaEntity>, UserEntity],
  Option<MediaEntity>
> = (ctx) => (m, orElse, creator) => {
  return pipe(
    m.image,
    fp.O.fromNullable,
    fp.O.map((image) =>
      pipe(
        ctx.db.findOne(MediaEntity, { where: { location: image } }),
        fp.TE.map((mOpt) =>
          pipe(
            mOpt,
            fp.O.alt(() =>
              fp.O.some<MediaEntity>({
                id: uuid(),
                label: image,
                thumbnail: image,
                location: image,
                description: image,
                type: "image/jpeg",
                createdAt: new Date(),
                updatedAt: new Date(),
                creator,
                events: [],
                areas: [],
                links: [],
                stories: [],
                keywords: [],
                featuredInStories: [],
                featuredInAreas: [],
                deletedAt: null,
                extra: null,
                ...orElse(image),
              }),
            ),
          ),
        ),
      ),
    ),
    fp.O.getOrElse(() =>
      fp.TE.right<ControllerError, Option<MediaEntity>>(fp.O.none),
    ),
  );
};
