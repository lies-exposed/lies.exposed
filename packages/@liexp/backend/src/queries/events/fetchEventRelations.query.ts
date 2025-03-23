import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/index.js";
import {
  type CreateEventLink,
  type EditEventCommon,
} from "@liexp/shared/lib/io/http/Events/BaseEvent.js";
import * as http from "@liexp/shared/lib/io/http/index.js";
import { Schema } from "effect";
import * as O from "effect/Option";
import { sequenceS } from "fp-ts/lib/Apply.js";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type DeepPartial } from "typeorm";
import { type DatabaseContext } from "../../context/db.context.js";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type URLMetadataContext } from "../../context/urlMetadata.context.js";
import { type ActorEntity } from "../../entities/Actor.entity.js";
import { type GroupEntity } from "../../entities/Group.entity.js";
import { type KeywordEntity } from "../../entities/Keyword.entity.js";
import { type LinkEntity } from "../../entities/Link.entity.js";
import { type MediaEntity } from "../../entities/Media.entity.js";
import { ServerError } from "../../errors/ServerError.js";
import { type URLMetadataClient } from "../../providers/URLMetadata.provider.js";
import { type DBError } from "../../providers/orm/index.js";
import { fetchActors } from "../actors/fetchActors.query.js";
import { fetchGroups } from "../groups/fetchGroups.query.js";
import { fetchKeywords } from "../keywords/fetchKeywords.query.js";
import { fetchLinks } from "../links/fetchLinks.query.js";
import { fetchManyMedia } from "../media/fetchManyMedia.query.js";

const fetchLinksT =
  (urlMetadata: URLMetadataClient) =>
  (
    links: readonly (http.Common.UUID | CreateEventLink)[],
  ): TE.TaskEither<DBError, readonly DeepPartial<LinkEntity>[]> => {
    return pipe(
      links,
      fp.A.reduce(
        { uuids: [] as UUID[], newLinks: [] as CreateEventLink[] },
        (acc, l) => {
          if (Schema.is(http.Common.UUID)(l)) {
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
              fp.A.map((link) =>
                pipe(
                  urlMetadata.fetchMetadata(
                    link.url,
                    {},
                    ServerError.fromUnknown,
                  ),

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
              fp.A.map((id): DeepPartial<LinkEntity> => ({ id })),
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
  (input: Pick<EditEventCommon, "links" | "keywords" | "media">) =>
  <C extends URLMetadataContext & LoggerContext>({
    urlMetadata,
    logger,
  }: C): TE.TaskEither<
    DBError,
    {
      keywords: readonly DeepPartial<KeywordEntity>[];
      links: readonly DeepPartial<LinkEntity>[];
      media: readonly DeepPartial<MediaEntity>[];
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
        fp.A.map((i) =>
          Schema.is(UUID)(i)
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
        fp.A.map((k) => ({ id: k })),
        TE.right,
      ),
    });
  };

export const fetchRelations =
  <C extends LoggerContext & DatabaseContext & ENVContext>(
    input: Pick<EditEventCommon, "keywords"> & {
      actors: O.Option<readonly UUID[]>;
      groups: O.Option<readonly UUID[]>;
      media: O.Option<readonly UUID[]>;
      links: O.Option<readonly UUID[]>;
      groupsMembers: O.Option<readonly UUID[]>;
    },
    isAdmin: boolean,
  ): ReaderTaskEither<
    C,
    DBError,
    {
      actors: ActorEntity[];
      groups: GroupEntity[];
      keywords: KeywordEntity[];
      media: MediaEntity[];
      links: LinkEntity[];
    }
  > =>
  (ctx) => {
    ctx.logger.debug.log("Links %O", input.links);
    ctx.logger.debug.log("Media %O", input.media);
    ctx.logger.debug.log("Keywords %O", input.keywords);

    return sequenceS(fp.TE.ApplicativePar)({
      actors: O.isSome(input.actors)
        ? pipe(
            fetchActors({
              ids: input.actors,
              _end: pipe(
                input.actors,
                O.map((a) => a.length),
              ),
            })(ctx),
            fp.TE.map((r) => r.results),
          )
        : TE.right([]),
      groups: O.isSome(input.groups)
        ? pipe(
            fetchGroups({
              ids: input.groups,
              _end: pipe(
                input.groups,
                O.map((a) => a.length),
              ),
            })(ctx),
            fp.TE.map(([results]) => results),
          )
        : TE.right([]),
      keywords: O.isSome(input.keywords)
        ? pipe(
            fetchKeywords(
              {
                ids: input.keywords,
                _end: pipe(
                  input.keywords,
                  O.map((a) => a.length),
                ),
              },
              isAdmin,
            )(ctx),
            fp.TE.map(([results]) => results),
          )
        : TE.right([]),
      media: O.isSome(input.media)
        ? pipe(
            fetchManyMedia({
              ids: input.media,
              _end: pipe(
                input.media,
                O.map((m) => m.length),
              ),
            })(ctx),
            fp.TE.map(([results]) => results),
          )
        : TE.right([]),
      links: O.isSome(input.links)
        ? pipe(
            fetchLinks(
              {
                ids: input.links,
                _end: pipe(
                  input.links,
                  O.map((a) => a.length),
                ),
              },
              false,
            )(ctx),
            fp.TE.map(([results]) => results),
          )
        : TE.right([]),
    });
  };
