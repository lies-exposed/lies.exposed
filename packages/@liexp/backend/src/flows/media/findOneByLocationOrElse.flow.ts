import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type URL } from "@liexp/shared/lib/io/http/Common/URL.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { ImageType } from "@liexp/shared/lib/io/http/Media/MediaType.js";
import { type Option } from "fp-ts/lib/Option.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { type Metadata } from "page-metadata-parser";
import { type DatabaseContext } from "../../context/db.context.js";
import { MediaEntity } from "../../entities/Media.entity.js";
import { type UserEntity } from "../../entities/User.entity.js";
import { type DBError } from "../../providers/orm/database.provider.js";

export const findOneByLocationOrElse =
  <C extends DatabaseContext>(
    m: Partial<Metadata>,
    orElse: (m: URL) => Partial<MediaEntity>,
    creator: UserEntity,
  ): ReaderTaskEither<C, DBError, Option<MediaEntity>> =>
  (ctx) => {
    return pipe(
      m.image as URL,
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
                  type: ImageType.members[1].literals[0],
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
        fp.TE.right<DBError, Option<MediaEntity>>(fp.O.none),
      ),
    );
  };
