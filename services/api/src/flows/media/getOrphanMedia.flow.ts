import { type ListObjectsOutput, type _Object } from "@aws-sdk/client-s3";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import { getResourceAndIdFromLocation } from "@liexp/shared/lib/utils/media.utils.js";
import { type Option } from "fp-ts/lib/Option.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { Equal, Like } from "typeorm";
import { ActorEntity } from "#entities/Actor.entity";
import { GroupEntity } from "#entities/Group.entity";
import { MediaEntity } from "#entities/Media.entity";
import { type TEFlow } from "#flows/flow.types";
import { type ControllerError } from "#io/ControllerError";

export const getOrphanMediaFlow: TEFlow<[], _Object[]> = (ctx) => () => {
  return pipe(
    walkPaginatedRequest(ctx)<ListObjectsOutput, ControllerError, _Object>(
      ({ skip, amount, results }) =>
        ctx.s3.listObjects({
          Bucket: ctx.env.SPACE_BUCKET,
          MaxKeys: amount,
          Marker: results.length > 0 ? results[results.length].ETag : undefined,
        }),
      (r) => r.Contents?.length ?? 0,
      (d) =>
        d.Contents?.filter(
          (e) =>
            e.Key?.startsWith("public") &&
            !e.Key?.startsWith("public/.gitkeep"),
        ) ?? [],
      0,
      1000,
    ),
    fp.TE.chain((objects) =>
      pipe(
        objects,
        (o) => {
          ctx.logger.info.log(`Total objects %d`, o.length);
          return o;
        },
        fp.A.traverse(fp.TE.ApplicativeSeq)(
          (e): TaskEither<ControllerError, [_Object, Option<any>]> => {
            if (e.Key) {
              const resourceAndId = getResourceAndIdFromLocation(e.Key);
              // console.log(e.Key);

              return pipe(
                resourceAndId,
                fp.O.map(({ resource, id }) => {
                  // console.log({ resource, id });
                  if (resource === "media") {
                    return ctx.db.findOne(MediaEntity, {
                      where: [
                        {
                          location: Like(`%${e.Key}`),
                        },
                        {
                          thumbnail: Like(`%${e.Key}`),
                        },
                      ],
                    });
                  }

                  if (resource === "actors") {
                    return ctx.db.findOne(ActorEntity, {
                      where: [
                        {
                          id: Equal(id as any),
                        },
                        {
                          avatar: Like(`%/actors/${id}/%`),
                        },
                      ],
                    });
                  }

                  if (resource === "groups") {
                    return ctx.db.findOne(GroupEntity, {
                      where: [
                        {
                          // avatar: Like(`%/actors/${id}/%`),
                          id: Equal(id as any),
                          // avatar: Like(`%/groups/${id}/%`),
                        },
                        {
                          avatar: Like(`%/groups/${id}/%`),
                        },
                      ],
                    });
                  }
                  return fp.TE.right(fp.O.none);
                }),
                fp.O.getOrElse(() =>
                  fp.TE.right<ControllerError, Option<any>>(fp.O.none),
                ),
                fp.TE.map((entity) => [e, entity]),
              );
            }
            return fp.TE.right([e, fp.O.none]);
          },
        ),
        fp.TE.map(
          fp.A.flatMap(([e, entity]) => (fp.O.isNone(entity) ? [e] : [])),
        ),
      ),
    ),
  );
};
