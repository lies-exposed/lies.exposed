import { type URLMetadataClient } from "@liexp/backend/lib/providers/URLMetadata.provider.js";
import { type DBError } from "@liexp/backend/lib/providers/orm/index.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import { type CreateLink } from "@liexp/shared/lib/io/http/Link.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { sequenceS } from "fp-ts/lib/Apply.js";
import * as A from "fp-ts/lib/Array.js";
import * as O from "fp-ts/lib/Option.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type DeepPartial } from "typeorm";
import { type ActorEntity } from "#entities/Actor.entity.js";
import { type GroupEntity } from "#entities/Group.entity.js";
import { type KeywordEntity } from "#entities/Keyword.entity.js";
import { type LinkEntity } from "#entities/Link.entity.js";
import { type MediaEntity } from "#entities/Media.entity.js";
import { ServerError } from "#io/ControllerError.js";
import { fetchActors } from "#queries/actors/fetchActors.query.js";
import { fetchGroups } from "#queries/groups/fetchGroups.query.js";
import { fetchKeywords } from "#queries/keywords/fetchKeywords.query.js";
import { fetchManyMedia } from "#queries/media/fetchManyMedia.query.js";
import { type RouteContext } from "#routes/route.types.js";

export const fetchLinksT =
  (urlMetadata: URLMetadataClient) =>
  (
    links: (http.Common.UUID | CreateLink)[],
  ): TE.TaskEither<DBError, DeepPartial<LinkEntity>[]> => {
    return pipe(
      links,
      A.reduce(
        { uuids: [] as UUID[], newLinks: [] as CreateLink[] },
        (acc, l) => {
          if (http.Common.UUID.is(l)) {
            return {
              ...acc,
              uuids: acc.uuids.concat(l),
            };
          }
          return {
            ...acc,
            newLinks: acc.newLinks.concat(l),
          };
        },
      ),
      ({ newLinks, uuids }) => {
        return pipe(
          sequenceS(TE.ApplicativePar)({
            linkWithMetadata: pipe(
              newLinks,
              A.map((link) =>
                pipe(
                  urlMetadata.fetchMetadata(link.url, {}, (e) => ServerError()),
                  TE.map((metadata) => ({
                    ...link,
                    ...metadata,
                    image: metadata.image
                      ? {
                          id: uuid(),
                          thumbnail: metadata.image,
                          location: metadata.image,
                        }
                      : null,
                    keywords: [],
                    events: [],
                    id: uuid(),
                  })),
                ),
              ),
              TE.sequenceSeqArray,
            ),

            linkUUIDs: pipe(
              uuids,
              A.map((id): DeepPartial<LinkEntity> => ({ id })),
              TE.right,
            ),
          }),
          TE.map(({ linkWithMetadata, linkUUIDs }) =>
            linkUUIDs.concat(linkWithMetadata),
          ),
        );
      },
    );
  };

export const fetchRelationIds =
  ({ urlMetadata, logger }: RouteContext) =>
  (
    input: Pick<http.Events.EditEventBody, "links" | "keywords" | "media">,
  ): TE.TaskEither<
    DBError,
    {
      keywords: DeepPartial<KeywordEntity>[];
      links: DeepPartial<LinkEntity>[];
      media: DeepPartial<MediaEntity>[];
    }
  > => {
    logger.debug.log("Links %O", input.links);
    logger.debug.log("Media %O", input.media);
    logger.debug.log("Keywords %O", input.keywords);
    return sequenceS(TE.ApplicativePar)({
      links: pipe(
        input.links,
        O.getOrElse((): any[] => []),
        fetchLinksT(urlMetadata),
      ),
      media: pipe(
        input.media,
        O.getOrElse((): any[] => []),
        A.map((i) =>
          UUID.is(i)
            ? { id: i }
            : {
                id: uuid(),
                ...i,
              },
        ),
        TE.right,
      ),
      keywords: pipe(
        input.keywords,
        O.getOrElse((): UUID[] => []),
        A.map((k) => ({ id: k })),
        TE.right,
      ),
    });
  };

export const fetchRelations =
  (ctx: RouteContext) =>
  (
    input: Pick<http.Events.EditEventBody, "links" | "keywords"> & {
      actors: O.Option<UUID[]>;
      groups: O.Option<UUID[]>;
      media: O.Option<UUID[]>;
      groupsMembers: O.Option<UUID[]>;
    },
    isAdmin: boolean,
  ): TE.TaskEither<
    DBError,
    {
      actors: ActorEntity[];
      groups: GroupEntity[];
      keywords: KeywordEntity[];
      media: MediaEntity[];
      // links: LinkEntity[];
    }
  > => {
    ctx.logger.debug.log("Links %O", input.links);
    ctx.logger.debug.log("Media %O", input.media);
    ctx.logger.debug.log("Keywords %O", input.keywords);

    return sequenceS(fp.TE.ApplicativePar)({
      actors: O.isSome(input.actors)
        ? pipe(
            fetchActors(ctx)({
              ids: input.actors,
              _end: pipe(
                input.actors,
                fp.O.map((a) => a.length as any),
              ),
            }),
            fp.TE.map((r) => r.results),
          )
        : TE.right([]),
      groups: O.isSome(input.groups)
        ? pipe(
            fetchGroups(ctx)({
              ids: input.groups,
              _end: pipe(
                input.groups,
                fp.O.map((a) => a.length as any),
              ),
            }),
            fp.TE.map(([results]) => results),
          )
        : TE.right([]),
      keywords: O.isSome(input.keywords)
        ? pipe(
            fetchKeywords(ctx)(
              {
                ids: input.keywords,
                _end: pipe(
                  input.keywords,
                  fp.O.map((a) => a.length as any),
                ),
              },
              isAdmin,
            ),
            fp.TE.map(([results]) => results),
          )
        : TE.right([]),
      media: O.isSome(input.media)
        ? pipe(
            fetchManyMedia(ctx)({
              ids: input.media,
              _end: pipe(
                input.media,
                fp.O.map((m) => m.length as any),
              ),
            }),
            fp.TE.map(([results]) => results),
          )
        : TE.right([]),
    });
  };
