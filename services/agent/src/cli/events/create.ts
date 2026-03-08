import { fp } from "@liexp/core/lib/fp/index.js";
import { CreateEventInputSchema } from "@liexp/shared/lib/mcp/schemas/events.schemas.js";
import { splitUUIDs } from "../args.js";
import { makeCommand } from "../run-command.js";

const EVENT_CREATE_NOTES = `
Uncategorized payload:
  --title=<string>             Event title (required)
  --actors=<uuid,uuid,...>     Actor UUIDs (optional)
  --groups=<uuid,uuid,...>     Group UUIDs (optional)
  --groupsMembers=<uuid,...>   Group-member UUIDs (optional)
  --location=<uuid>            Area UUID (optional)
  --endDate=<YYYY-MM-DD>       End date (optional)

Death payload:
  --victim=<uuid>              Actor UUID of the victim (required)
  --location=<uuid>            Area UUID (optional)

Quote payload:
  --actor=<uuid>               Actor UUID who made the quote
  --quote=<string>             Quote text
  --details=<string>           Additional details

Transaction payload:
  --title=<string>             Title (required)
  --total=<number>             Amount (required)
  --currency=<string>          Currency code e.g. USD (required)
  --fromType=<actor|group>     Sender type (required)
  --fromId=<uuid>              Sender UUID (required)
  --toType=<actor|group>       Recipient type (required)
  --toId=<uuid>                Recipient UUID (required)

ScientificStudy payload:
  --title=<string>             Title (required)
  --studyUrl=<uuid>            Link UUID for study URL (required)
  --image=<uuid>               Media UUID (optional)
  --publisher=<uuid>           Actor UUID of publisher (optional)
  --authors=<uuid,uuid,...>    Author actor UUIDs (optional)

Book payload:
  --title=<string>             Title (required)
  --pdf=<uuid>                 Media UUID for PDF (required)
  --audio=<uuid>               Media UUID for audio (optional)
  --authors=<uuid,uuid,...>    Author actor UUIDs (optional)
  --publisher=<uuid>           Actor/group UUID of publisher (optional)

Patent payload:
  --title=<string>             Title (required)
  --ownerActors=<uuid,...>     Actor UUIDs as owners (optional)
  --ownerGroups=<uuid,...>     Group UUIDs as owners (optional)
  --source=<uuid>              Link UUID as patent source (optional)

Documentary payload:
  --title=<string>             Title (required)
  --documentaryMedia=<uuid>    Media UUID for the documentary (required)
  --website=<uuid>             Link UUID for website (optional)
  --authorActors=<uuid,...>    Author actor UUIDs (optional)
  --authorGroups=<uuid,...>    Author group UUIDs (optional)
  --subjectActors=<uuid,...>   Subject actor UUIDs (optional)
  --subjectGroups=<uuid,...>   Subject group UUIDs (optional)`;

export const eventCreate = makeCommand(
  CreateEventInputSchema,
  {
    usage: "event create",
    description:
      "Create a new event. The --type flag determines which payload fields are required.",
    output: "JSON created event object",
    notes: EVENT_CREATE_NOTES,
  },
  (input, ctx) => {
    ctx.logger.debug.log("event create input: %O", input);

    const common = {
      date: new Date(input.date),
      draft: input.draft ?? false,
      excerpt: input.excerpt as any,
      media: splitUUIDs(input.media) as any[],
      links: splitUUIDs(input.links) as any[],
      keywords: splitUUIDs(input.keywords) as any[],
    };

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
        if (
          !input.title ||
          input.total === undefined ||
          !input.currency ||
          !input.fromType ||
          !input.fromId ||
          !input.toType ||
          !input.toId
        ) {
          return fp.TE.left(
            new Error(
              "--title, --total, --currency, --fromType, --fromId, --toType, --toId are required for Transaction events",
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
            from: { type: input.fromType, id: input.fromId },
            to: { type: input.toType, id: input.toId },
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
        if (!input.title) {
          return fp.TE.left(
            new Error("--title is required for Uncategorized events"),
          );
        }
        body = {
          ...common,
          type: "Uncategorized" as const,
          payload: {
            title: input.title,
            actors: splitUUIDs(input.actors),
            groups: splitUUIDs(input.groups),
            groupsMembers: splitUUIDs(input.groupsMembers),
            location: input.location ?? null,
            endDate: input.endDate ? new Date(input.endDate) : null,
          },
        };
        break;
    }

    return ctx.api.Event.Create({ Body: body });
  },
);
