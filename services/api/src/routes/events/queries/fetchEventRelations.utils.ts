import { fp } from "@liexp/core/fp";
import * as http from "@liexp/shared/io/http";
import { type CreateLink } from "@liexp/shared/io/http/Link";
import { type URLMetadataClient } from "@liexp/shared/providers/URLMetadata.provider";
import { type DBError } from "@liexp/shared/providers/orm";
import { uuid } from "@liexp/shared/utils/uuid";
import { sequenceS } from "fp-ts/Apply";
import * as A from "fp-ts/Array";
import * as O from "fp-ts/Option";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { UUID } from "io-ts-types/lib/UUID";
import { type DeepPartial } from "typeorm";
import { fetchActors } from "../../../queries/actors/fetchActors.query";
import { fetchGroups } from "../../../queries/groups/fetchGroups.query";
import { fetchKeywords } from "../../../queries/keywords/fetchKeywords.query";
import { type ActorEntity } from "@entities/Actor.entity";
import { type GroupEntity } from "@entities/Group.entity";
import { type KeywordEntity } from "@entities/Keyword.entity";
import { type LinkEntity } from "@entities/Link.entity";
import { type MediaEntity } from "@entities/Media.entity";
import { ServerError } from "@io/ControllerError";
import { type RouteContext } from "@routes/route.types";

export const fetchLinksT =
  (urlMetadata: URLMetadataClient) =>
  (
    links: Array<http.Common.UUID | CreateLink>
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
        }
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
                  }))
                )
              ),
              TE.sequenceSeqArray
            ),

            linkUUIDs: pipe(
              uuids,
              A.map((id): DeepPartial<LinkEntity> => ({ id })),
              TE.right
            ),
          }),
          TE.map(({ linkWithMetadata, linkUUIDs }) =>
            linkUUIDs.concat(linkWithMetadata)
          )
        );
      }
    );
  };

export const fetchRelationIds =
  ({ urlMetadata, logger }: RouteContext) =>
  (
    input: Pick<http.Events.EditEventBody, "links" | "keywords" | "media">
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
        fetchLinksT(urlMetadata)
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
              }
        ),
        TE.right
      ),
      keywords: pipe(
        input.keywords,
        O.getOrElse((): UUID[] => []),
        A.map((k) => ({ id: k })),
        TE.right
      ),
    });
  };

export const fetchRelations =
  (ctx: RouteContext) =>
  (
    input: Pick<http.Events.EditEventBody, "links" | "keywords" | "media"> & {
      actors: O.Option<UUID[]>;
      groups: O.Option<UUID[]>;
      groupsMembers: O.Option<UUID[]>;
    }
  ): TE.TaskEither<
    DBError,
    {
      actors: ActorEntity[];
      groups: GroupEntity[];
      keywords: KeywordEntity[];
      // links: LinkEntity[];
      // media: MediaEntity[];
    }
  > => {
    ctx.logger.debug.log("Links %O", input.links);
    ctx.logger.debug.log("Media %O", input.media);
    ctx.logger.debug.log("Keywords %O", input.keywords);

    return sequenceS(fp.TE.ApplicativePar)({
      actors: pipe(
        fetchActors(ctx)({
          ids: input.actors,
          _end: pipe(
            input.actors,
            fp.O.map((a) => a.length as any)
          ),
        }),
        fp.TE.map((r) => r.results)
      ),
      groups: pipe(
        fetchGroups(ctx)({
          ids: input.groups,
          _end: pipe(
            input.groups,
            fp.O.map((a) => a.length as any)
          ),
        }),
        fp.TE.map(([results]) => results)
      ),
      keywords: pipe(
        fetchKeywords(ctx)({
          ids: input.keywords,
          _end: pipe(
            input.keywords,
            fp.O.map((a) => a.length as any)
          ),
        }),
        fp.TE.map(([results]) => results)
      ),
    });
  };
