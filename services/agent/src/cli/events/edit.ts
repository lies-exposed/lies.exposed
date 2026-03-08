import { fp } from "@liexp/core/lib/fp/index.js";
import { EditEventInputSchema } from "@liexp/shared/lib/mcp/schemas/events.schemas.js";
import { removeUndefinedFromPayload } from "@liexp/shared/lib/utils/fp.utils.js";
import { splitUUIDs } from "../args.js";
import { makeCommand } from "../run-command.js";

const EVENT_EDIT_NOTES = `
Uncategorized payload:
  --title=<string>             Event title
  --actors=<uuid,uuid,...>     Actor UUIDs
  --groups=<uuid,uuid,...>     Group UUIDs
  --groupsMembers=<uuid,...>   Group-member UUIDs
  --location=<uuid>            Area UUID
  --endDate=<YYYY-MM-DD>       End date

Death payload:
  --victim=<uuid>              Actor UUID of the victim (required)
  --location=<uuid>            Area UUID

Quote payload:
  --actor=<uuid>               Actor UUID who made the quote
  --quote=<string>             Quote text
  --details=<string>           Additional details

Transaction payload:
  --title=<string>             Title
  --total=<number>             Amount
  --currency=<string>          Currency code
  --fromType=<actor|group>     Sender type
  --fromId=<uuid>              Sender UUID
  --toType=<actor|group>       Recipient type
  --toId=<uuid>                Recipient UUID

ScientificStudy payload:
  --title=<string>             Title
  --studyUrl=<uuid>            Link UUID for study URL
  --image=<uuid>               Media UUID
  --publisher=<uuid>           Actor UUID of publisher
  --authors=<uuid,uuid,...>    Author actor UUIDs

Book payload:
  --title=<string>             Title
  --pdf=<uuid>                 Media UUID for PDF
  --audio=<uuid>               Media UUID for audio
  --authors=<uuid,uuid,...>    Author actor UUIDs
  --publisher=<uuid>           Publisher UUID

Patent payload:
  --title=<string>             Title
  --ownerActors=<uuid,...>     Actor UUIDs as owners
  --ownerGroups=<uuid,...>     Group UUIDs as owners
  --source=<uuid>              Link UUID as patent source

Documentary payload:
  --title=<string>             Title
  --documentaryMedia=<uuid>    Media UUID for the documentary
  --website=<uuid>             Link UUID for website
  --authorActors=<uuid,...>    Author actor UUIDs
  --authorGroups=<uuid,...>    Author group UUIDs
  --subjectActors=<uuid,...>   Subject actor UUIDs
  --subjectGroups=<uuid,...>   Subject group UUIDs`;

export const eventEdit = makeCommand(
  EditEventInputSchema,
  {
    usage: "event edit",
    description:
      "Edit an existing event by UUID. The --type flag determines which payload fields apply.",
    output: "JSON updated event object",
    notes: EVENT_EDIT_NOTES,
  },
  (input, ctx) => {
    ctx.logger.debug.log("event edit input: %O", input);

    const common = removeUndefinedFromPayload({
      date: input.date ? new Date(input.date) : undefined,
      draft: input.draft,
      excerpt: input.excerpt as any,
      media: input.media !== undefined ? (splitUUIDs(input.media) as any[]) : undefined,
      links: input.links !== undefined ? (splitUUIDs(input.links) as any[]) : undefined,
      keywords: input.keywords !== undefined ? (splitUUIDs(input.keywords) as any[]) : undefined,
    });

    let body: any;

    switch (input.type) {
      case "Death":
        if (!input.victim) {
          return fp.TE.left(
            new Error("--victim=<uuid> is required for Death events"),
          );
        }
        body = {
          ...common,
          type: "Death" as const,
          payload: {
            victim: input.victim,
            location: input.location ?? null,
          },
        };
        break;

      case "Quote":
        body = {
          ...common,
          type: "Quote" as const,
          payload: {
            actor: input.actor,
            subject: undefined,
            quote: input.quote,
            details: input.details,
          },
        };
        break;

      case "Transaction":
        if (!input.title || input.total === undefined || !input.currency) {
          return fp.TE.left(
            new Error(
              "--title, --total, --currency are required for Transaction events",
            ),
          );
        }
        body = {
          ...common,
          type: "Transaction" as const,
          payload: {
            title: input.title,
            total: input.total,
            currency: input.currency,
            from:
              input.fromType && input.fromId
                ? { type: input.fromType, id: input.fromId }
                : undefined,
            to:
              input.toType && input.toId
                ? { type: input.toType, id: input.toId }
                : undefined,
          },
        };
        break;

      case "ScientificStudy":
        if (!input.title || !input.studyUrl) {
          return fp.TE.left(
            new Error(
              "--title and --studyUrl are required for ScientificStudy events",
            ),
          );
        }
        body = {
          ...common,
          type: "ScientificStudy" as const,
          payload: {
            title: input.title,
            url: input.studyUrl,
            image: input.image,
            publisher: input.publisher,
            authors: splitUUIDs(input.authors),
          },
        };
        break;

      case "Book":
        if (!input.title || !input.pdf) {
          return fp.TE.left(
            new Error("--title and --pdf are required for Book events"),
          );
        }
        body = {
          ...common,
          type: "Book" as const,
          payload: {
            title: input.title,
            media: {
              pdf: input.pdf,
              audio: input.audio,
            },
            authors: splitUUIDs(input.authors).map((id) => ({
              type: "actor",
              id,
            })),
            publisher: input.publisher
              ? { type: "actor", id: input.publisher }
              : undefined,
          },
        };
        break;

      case "Patent":
        if (!input.title) {
          return fp.TE.left(new Error("--title is required for Patent events"));
        }
        body = {
          ...common,
          type: "Patent" as const,
          payload: {
            title: input.title,
            owners: {
              actors: splitUUIDs(input.ownerActors),
              groups: splitUUIDs(input.ownerGroups),
            },
            source: input.source,
          },
        };
        break;

      case "Documentary":
        if (!input.title || !input.documentaryMedia) {
          return fp.TE.left(
            new Error(
              "--title and --documentaryMedia are required for Documentary events",
            ),
          );
        }
        body = {
          ...common,
          type: "Documentary" as const,
          payload: {
            title: input.title,
            media: input.documentaryMedia,
            website: input.website ?? null,
            authors: {
              actors: splitUUIDs(input.authorActors),
              groups: splitUUIDs(input.authorGroups),
            },
            subjects: {
              actors: splitUUIDs(input.subjectActors),
              groups: splitUUIDs(input.subjectGroups),
            },
          },
        };
        break;

      case "Uncategorized":
      default:
        body = {
          ...common,
          type: "Uncategorized" as const,
          payload: {
            title: input.title ?? "",
            actors: splitUUIDs(input.actors),
            groups: splitUUIDs(input.groups),
            groupsMembers: splitUUIDs(input.groupsMembers),
            location: input.location ?? null,
            endDate: input.endDate ? new Date(input.endDate) : null,
          },
        };
        break;
    }

    return ctx.api.Event.Edit({
      Params: { id: input.id },
      Body: body,
    });
  },
);
