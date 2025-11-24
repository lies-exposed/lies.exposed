import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { type KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { LinkIO } from "@liexp/backend/lib/io/link.io.js";
import { LoggerService } from "@liexp/backend/lib/services/logger/logger.service.js";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { UUID } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { type CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { Schema } from "effect";
import { type ReaderTaskEither } from "fp-ts/lib/ReaderTaskEither.js";
import { Equal, In } from "typeorm";
import { type ServerContext } from "../../../../context/context.type.js";
import { formatLinkToMarkdown } from "../formatters/linkToMarkdown.formatter.js";

export const EditLinkInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the link to edit",
  }),
  url: Schema.UndefinedOr(Schema.String).annotations({
    description: "URL of the link or undefined to keep current",
  }),
  title: Schema.UndefinedOr(Schema.String).annotations({
    description: "Title of the link or undefined to keep current",
  }),
  description: Schema.UndefinedOr(Schema.String).annotations({
    description: "Description of the link or undefined to keep current",
  }),
  publishDate: Schema.UndefinedOr(Schema.String).annotations({
    description: "Publication date in ISO format or undefined to keep current",
  }),
  provider: Schema.UndefinedOr(Schema.String).annotations({
    description: "Provider/source name or undefined to keep current",
  }),
  image: Schema.UndefinedOr(UUID).annotations({
    description: "Image/thumbnail media UUID or undefined to keep current",
  }),
  events: Schema.Array(UUID).annotations({
    description: "Array of event UUIDs to associate with this link",
  }),
  keywords: Schema.Array(UUID).annotations({
    description: "Array of keyword UUIDs to associate with this link",
  }),
});
export type EditLinkInputSchema = typeof EditLinkInputSchema.Type;

export const editLinkToolTask = ({
  id,
  url,
  title,
  description,
  publishDate,
  provider,
  image,
  events,
  keywords,
}: EditLinkInputSchema): ReaderTaskEither<
  ServerContext,
  Error,
  CallToolResult
> => {
  return pipe(
    ({ db }: ServerContext) => {
      const linkUpdate: Partial<LinkEntity> = {
        id,
        ...(url ? { url: sanitizeURL(url as any) } : {}),
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(publishDate ? { publishDate: new Date(publishDate) } : {}),
        ...(provider ? { provider: provider as any } : {}),
        ...(image ? { image: image as any } : {}),
        events: events.map((e) => ({ id: e })) as EventV2Entity[],
        keywords: keywords.map((k) => ({ id: k })) as KeywordEntity[],
      };

      return pipe(
        db.findOneOrFail(LinkEntity, {
          where: { id: Equal(id) },
          relations: ["image"],
        }),
        fp.TE.chain((existingLink) =>
          db.save(LinkEntity, [
            {
              ...existingLink,
              ...linkUpdate,
              image: linkUpdate.image ?? existingLink.image,
            },
          ]),
        ),
        fp.TE.chain(([link]) =>
          pipe(
            db.find(EventV2Entity, {
              where: { id: In(events) },
              loadRelationIds: { relations: ["links"] },
            }),
            fp.TE.chain((evts) =>
              db.save(
                EventV2Entity,
                evts.map((e) => ({
                  ...e,
                  links: (e.links as any[] as string[])
                    .filter((l) => l !== link.id)
                    .map((l) => ({ id: l }))
                    .concat({ id: link.id } as any),
                })),
              ),
            ),
          ),
        ),
        fp.TE.chain(() =>
          db.findOneOrFail(LinkEntity, {
            where: { id: Equal(id) },
            relations: ["image"],
            loadRelationIds: { relations: ["events", "keywords"] },
          }),
        ),
        fp.TE.chainEitherK((l) => LinkIO.decodeSingle(l)),
      );
    },
    LoggerService.RTE.debug("Updated link %O"),
    fp.RTE.map((link) => ({
      content: [
        {
          text: formatLinkToMarkdown(link),
          type: "text" as const,
          href: `link://${link.id}`,
        },
      ],
    })),
  );
};
