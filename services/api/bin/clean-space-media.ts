import { type ListObjectsOutput, type _Object } from "@aws-sdk/client-s3";
import { fp } from "@liexp/core/lib/fp";
import { formatDistanceToNow } from "@liexp/shared/lib/utils/date.utils";
import { walkPaginatedRequest } from "@liexp/shared/lib/utils/fp.utils";
import { getResourceAndIdFromLocation } from "@liexp/shared/lib/utils/media.utils";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
// eslint-disable-next-line import/no-named-as-default
import prompts from "prompts";
import D from "debug";
import { type Option } from "fp-ts/Option";
import { type TaskEither } from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { Equal, Like } from "typeorm";
import { startContext, stopContext } from "./start-ctx";
import { ActorEntity } from "@entities/Actor.entity";
import { GroupEntity } from "@entities/Group.entity";
import { MediaEntity } from "@entities/Media.entity";
import { type ControllerError } from "@io/ControllerError";

/**
 * Usage clean-space-media [--dry] [-i|--interactive]
 *
 * -i      interactive mode
 * --dry    dry mode
 *
 * @returns void
 */
const run = async (): Promise<any> => {
  const dry = !!process.argv.find((a) => a === "--dry");
  const interactive = !!process.argv.find(
    (a) => a === "-i" || a === "--interactive",
  );

  const ctx = await startContext();

  D.enable(ctx.env.DEBUG);

  const result = await pipe(
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
    throwTE,
  );

  ctx.logger.info.log("Orphan media count: %d", result.length);

  for await (const e of result) {
    const output = {
      age: e.LastModified ? formatDistanceToNow(e.LastModified) : "unknown",
      url: `https://${ctx.env.SPACE_BUCKET}.${ctx.env.SPACE_REGION}.cdn.${ctx.env.SPACE_ENDPOINT}/${e.Key}`,
    };

    ctx.logger.info.log("Orphan media %O", output);

    const choice =
      interactive && !dry
        ? await prompts({
            message: "Delete media?",
            type: "select",
            name: "del",
            choices: [true, false].map((r) => ({
              title: r ? "yes" : "no",
              value: r,
            })),
          })
        : { del: !dry };

    if (choice.del) {
      await pipe(
        ctx.s3.deleteObject({ Bucket: ctx.env.SPACE_BUCKET, Key: e.Key }),
        throwTE,
      );
    }
  }

  await stopContext(ctx);
};

// eslint-disable-next-line no-console
void run().then(console.log).catch(console.error);
