import path from "path";
import { type ListObjectsOutput, type _Object } from "@aws-sdk/client-s3";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils.js";
import { getResourceAndIdFromLocation } from "@liexp/shared/lib/utils/media.utils.js";
import { type Option } from "fp-ts/lib/Option.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import { Equal, Like } from "typeorm";
import { ActorEntity } from "#entities/Actor.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { MediaEntity } from "#entities/Media.entity.js";
import { type TEReader } from "#flows/flow.types.js";
import { getOlderThanOr } from "#flows/fs/getOlderThanOr.flow.js";
import { type ControllerError } from "#io/ControllerError.js";
import { type RouteContext } from "#routes/route.types.js";

export interface GetOrphanMediaFlowOutput {
  orphans: _Object[];
  match: _Object[];
}

type ItemObject = ActorEntity | GroupEntity | MediaEntity;
type ObjectMediaPair = [_Object, Option<ItemObject>];

export const getOrphanMediaFlow = (): TEReader<GetOrphanMediaFlowOutput> => {
  return pipe(
    fp.RTE.ask<RouteContext>(),
    fp.RTE.map((ctx) =>
      path.resolve(ctx.config.dirs.temp.stats, `media/orphan-media.json`),
    ),
    fp.RTE.chain((orphanMediaCachePath) =>
      getOlderThanOr(
        orphanMediaCachePath,
        5 * 24,
      )(
        pipe(
          fp.RTE.ask<RouteContext>(),
          fp.RTE.chainTaskEitherK((ctx) =>
            walkPaginatedRequest<ListObjectsOutput, ControllerError, _Object>(
              ({ skip, amount, results }) =>
                ctx.s3.listObjects({
                  Bucket: ctx.env.SPACE_BUCKET,
                  MaxKeys: amount,
                  Marker:
                    results.length > 0
                      ? results[results.length].ETag
                      : undefined,
                }),
              (r) => r.Contents?.length ?? 0,
              (d) =>
                fp.TE.right(
                  d.Contents?.filter(
                    (e) =>
                      e.Key?.startsWith("public") &&
                      !e.Key?.startsWith("public/.gitkeep"),
                  ) ?? [],
                ),
              0,
              1000,
            )(ctx),
          ),
          fp.RTE.chain(
            (objects) => (ctx) =>
              pipe(
                objects,
                (o) => {
                  ctx.logger.info.log(`Total objects %d`, o.length);
                  return o;
                },
                fp.A.traverse(fp.TE.ApplicativeSeq)(
                  (e): TaskEither<ControllerError, ObjectMediaPair> => {
                    if (e.Key) {
                      const resourceAndId = getResourceAndIdFromLocation(e.Key);

                      return pipe(
                        resourceAndId,
                        fp.O.map(({ resource, id }) => {
                          if (resource === "media") {
                            return ctx.db.findOne(MediaEntity, {
                              where: [
                                {
                                  location: Like(`%${e.Key}`),
                                },
                              ],
                            });
                          }

                          if (resource === "actors") {
                            return ctx.db.findOne(ActorEntity, {
                              where: [
                                {
                                  id: Equal(id),
                                },
                              ],
                            });
                          }

                          if (resource === "groups") {
                            return ctx.db.findOne(GroupEntity, {
                              where: [
                                {
                                  id: Equal(id),
                                },
                              ],
                            });
                          }
                          return fp.TE.right(fp.O.none);
                        }),
                        fp.O.getOrElse(() =>
                          fp.TE.right<ControllerError, Option<ItemObject>>(
                            fp.O.none,
                          ),
                        ),
                        fp.TE.map((entity): ObjectMediaPair => [e, entity]),
                      );
                    }
                    return fp.TE.right([e, fp.O.none]);
                  },
                ),
                fp.TE.map(
                  fp.A.reduce<ObjectMediaPair, GetOrphanMediaFlowOutput>(
                    { orphans: [], match: [] },
                    (acc, [e, entity]) => {
                      if (fp.O.isNone(entity)) {
                        acc.orphans.push(e);
                      } else {
                        acc.match.push(e);
                      }
                      return acc;
                    },
                  ),
                ),
              ),
          ),
        ),
      ),
    ),
  );
};
