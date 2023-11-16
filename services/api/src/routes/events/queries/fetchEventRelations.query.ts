import { type URLMetadataClient } from "@liexp/backend/lib/providers/URLMetadata.provider";
import { type DBError } from "@liexp/backend/lib/providers/orm";
import { fp } from "@liexp/core/lib/fp";
import * as http from "@liexp/shared/lib/io/http";
import { type CreateLink } from "@liexp/shared/lib/io/http/Link";
import { uuid } from "@liexp/shared/lib/utils/uuid";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { type DeepPartial } from "typeorm";
import { type ActorEntity } from "@entities/Actor.entity";
import { type GroupEntity } from "@entities/Group.entity";
import { type KeywordEntity } from "@entities/Keyword.entity";
import { type LinkEntity } from "@entities/Link.entity";
import { type MediaEntity } from "@entities/Media.entity";
import { ServerError } from "@io/ControllerError";
import { fetchActors } from "@queries/actors/fetchActors.query";
import { fetchGroups } from "@queries/groups/fetchGroups.query";
import { fetchKeywords } from "@queries/keywords/fetchKeywords.query";
import { fetchManyMedia } from "@queries/media/fetchManyMedia.query";
import { type RouteContext } from "@routes/route.types";

export const fetchLinksT =
  (urlMetadata: URLMetadataClient) =>
  (
    links: Array<http.Common.UUID | CreateLink>,
  ): TE.TaskEither<DBError, Array<DeepPartial<LinkEntity>>> => {
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
      keywords: Array<DeepPartial<KeywordEntity>>;
      links: Array<DeepPartial<LinkEntity>>;
      media: Array<DeepPartial<MediaEntity>>;
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
    isAdmin: boolean
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
            fetchKeywords(ctx)({
              ids: input.keywords,
              _end: pipe(
                input.keywords,
                fp.O.map((a) => a.length as any),
              ),
            }, isAdmin),
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
