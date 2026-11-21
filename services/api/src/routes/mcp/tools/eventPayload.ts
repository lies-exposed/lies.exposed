import { Schema } from "effect";
import * as O from "effect/Option";

export const EventTypeSchema = Schema.Union(
  Schema.Literal("Uncategorized"),
  Schema.Literal("Death"),
  Schema.Literal("Quote"),
  Schema.Literal("Transaction"),
  Schema.Literal("ScientificStudy"),
  Schema.Literal("Book"),
  Schema.Literal("Patent"),
  Schema.Literal("Documentary"),
);

const SubjectRefSchema = Schema.Struct({
  type: Schema.Literal("Actor", "Group"),
  id: Schema.String,
});

const str = (description: string) =>
  Schema.UndefinedOr(Schema.String).annotations({ description });
const uuids = (description: string) =>
  Schema.UndefinedOr(Schema.Array(Schema.String)).annotations({ description });
const subject = (description: string) =>
  Schema.UndefinedOr(SubjectRefSchema).annotations({ description });

/** Type-specific input fields shared by createEvent and editEvent. */
export const EventTypeFieldsSchema = Schema.Struct({
  title: str(
    "Title (Uncategorized, Transaction, Book, Patent, ScientificStudy, Documentary)",
  ),
  // Uncategorized
  actors: uuids("Actor UUIDs involved (Uncategorized)"),
  groups: uuids("Group UUIDs involved (Uncategorized)"),
  groupsMembers: uuids(
    "Group UUIDs whose members are involved (Uncategorized)",
  ),
  location: str("Area UUID of the location (Uncategorized, Death)"),
  endDate: str("End date YYYY-MM-DD (Uncategorized)"),
  // Death
  victim: str("Actor UUID of the person who died (Death, required on create)"),
  // Quote
  actor: str("Actor UUID who said the quote (Quote)"),
  quote: str("Quote text (Quote)"),
  details: str("Extra details about the quote (Quote)"),
  subject: subject(
    'Subject of the quote as { "type": "Actor"|"Group", "id": uuid } (Quote)',
  ),
  // Transaction
  total: Schema.UndefinedOr(Schema.Number).annotations({
    description: "Transaction amount as a number (Transaction)",
  }),
  currency: str("Currency code, e.g. USD (Transaction)"),
  from: subject(
    'Payer as { "type": "Actor"|"Group", "id": uuid } (Transaction)',
  ),
  to: subject('Payee as { "type": "Actor"|"Group", "id": uuid } (Transaction)'),
  // ScientificStudy
  url: str("Link UUID of the study page (ScientificStudy, required on create)"),
  image: str("Media UUID of the study image (ScientificStudy)"),
  studyAuthors: uuids("Author actor UUIDs (ScientificStudy)"),
  studyPublisher: str("Publisher group UUID (ScientificStudy)"),
  // Book
  pdf: str("Media UUID of the book PDF (Book, required on create)"),
  audio: str("Media UUID of the audiobook (Book)"),
  authors: Schema.UndefinedOr(Schema.Array(SubjectRefSchema)).annotations({
    description: 'Authors as [{ "type": "Actor"|"Group", "id": uuid }] (Book)',
  }),
  publisher: subject(
    'Publisher as { "type": "Actor"|"Group", "id": uuid } (Book)',
  ),
  // Patent
  ownerActors: uuids("Owner actor UUIDs (Patent)"),
  ownerGroups: uuids("Owner group UUIDs (Patent)"),
  source: str("Link UUID of the patent source (Patent, required on create)"),
  // Documentary
  documentaryMedia: str(
    "Media UUID of the documentary (Documentary, required on create)",
  ),
  website: str("Link UUID of the documentary website (Documentary)"),
  authorActors: uuids("Author actor UUIDs (Documentary)"),
  authorGroups: uuids("Author group UUIDs (Documentary)"),
  subjectActors: uuids("Subject actor UUIDs (Documentary)"),
  subjectGroups: uuids("Subject group UUIDs (Documentary)"),
});

/**
 * Flat, LLM-friendly event input -> per-type event payload.
 *
 * The event payload shapes live in `@liexp/io/lib/http/Events/*`. They differ a
 * lot per type (nested owners/authors/subjects, subject references, ...), so
 * the MCP tools accept flat, explicitly named fields and map them here.
 *
 * Kept free of DB/context dependencies so it can be unit tested without a
 * database.
 */

interface SubjectRef {
  type: "Actor" | "Group";
  id: string;
}

export interface EventTypeFields {
  /** Uncategorized, Transaction, Book, Patent, ScientificStudy, Documentary */
  title?: string | undefined;
  // Uncategorized
  actors?: readonly string[] | undefined;
  groups?: readonly string[] | undefined;
  groupsMembers?: readonly string[] | undefined;
  /** Uncategorized / Death: area UUID */
  location?: string | undefined;
  endDate?: string | undefined;
  // Death
  victim?: string | undefined;
  // Quote
  actor?: string | undefined;
  quote?: string | undefined;
  details?: string | undefined;
  subject?: SubjectRef | undefined;
  // Transaction
  total?: number | undefined;
  currency?: string | undefined;
  from?: SubjectRef | undefined;
  to?: SubjectRef | undefined;
  // ScientificStudy
  url?: string | undefined;
  image?: string | undefined;
  studyAuthors?: readonly string[] | undefined;
  studyPublisher?: string | undefined;
  // Book
  pdf?: string | undefined;
  audio?: string | undefined;
  authors?: readonly SubjectRef[] | undefined;
  publisher?: SubjectRef | undefined;
  // Patent
  ownerActors?: readonly string[] | undefined;
  ownerGroups?: readonly string[] | undefined;
  source?: string | undefined;
  // Documentary
  documentaryMedia?: string | undefined;
  website?: string | undefined;
  authorActors?: readonly string[] | undefined;
  authorGroups?: readonly string[] | undefined;
  subjectActors?: readonly string[] | undefined;
  subjectGroups?: readonly string[] | undefined;
}

const toDate = (v: string | undefined): Date | undefined =>
  v ? new Date(v) : undefined;

const optionOf = <A>(v: A | undefined): O.Option<A> =>
  v === undefined ? O.none() : O.some(v);

const REQUIRED_ON_CREATE: Record<string, (keyof EventTypeFields)[]> = {
  Uncategorized: ["title"],
  Death: ["victim"],
  Transaction: ["title", "total", "currency", "from", "to"],
  ScientificStudy: ["title", "url"],
  Book: ["title", "pdf"],
  Patent: ["title", "source"],
  Documentary: ["title", "documentaryMedia"],
};

/**
 * Payload for `createEventQuery` (`CreateEventPlainBody["payload"]`).
 * Optional location/endDate are effect Options as the schemas decode them.
 * Throws when a field required by the event type is missing.
 */
export const buildCreatePayload = (
  type: string,
  f: EventTypeFields,
): Record<string, unknown> => {
  const missing = (REQUIRED_ON_CREATE[type] ?? []).filter(
    (k) => f[k] === undefined,
  );
  if (missing.length > 0) {
    throw new Error(
      `Missing required field(s) for ${type} event: ${missing.join(", ")}`,
    );
  }

  switch (type) {
    case "Death":
      return { victim: f.victim, location: optionOf(f.location) };
    case "Quote":
      return {
        actor: f.actor,
        quote: f.quote,
        details: f.details,
        subject: f.subject,
      };
    case "Transaction":
      return {
        title: f.title,
        total: f.total,
        currency: f.currency,
        from: f.from,
        to: f.to,
      };
    case "ScientificStudy":
      return {
        title: f.title,
        url: f.url,
        image: f.image,
        authors: f.studyAuthors ?? [],
        publisher: f.studyPublisher,
      };
    case "Book":
      return {
        title: f.title,
        media: { pdf: f.pdf, audio: f.audio },
        authors: f.authors ?? [],
        publisher: f.publisher,
      };
    case "Patent":
      return {
        title: f.title,
        owners: { actors: f.ownerActors ?? [], groups: f.ownerGroups ?? [] },
        source: f.source,
      };
    case "Documentary":
      return {
        title: f.title,
        media: f.documentaryMedia,
        website: f.website,
        authors: { actors: f.authorActors ?? [], groups: f.authorGroups ?? [] },
        subjects: {
          actors: f.subjectActors ?? [],
          groups: f.subjectGroups ?? [],
        },
      };
    case "Uncategorized":
    default:
      return {
        title: f.title,
        actors: f.actors ?? [],
        groups: f.groups ?? [],
        groupsMembers: f.groupsMembers ?? [],
        location: optionOf(f.location),
        endDate: optionOf(toDate(f.endDate)),
      };
  }
};

type StoredPayload = Record<string, any> | null | undefined;

const nested = (stored: StoredPayload, key: string): Record<string, any> =>
  (stored?.[key] as Record<string, any> | undefined) ?? {};

/**
 * Payload for `editEventQuery`: only provided fields, each wrapped in an
 * Option (`editEventQuery` unwraps with `foldOptionals`, which silently drops
 * plain values). Nested structures are merged with the stored payload so that
 * editing e.g. only `pdf` keeps the existing `audio`.
 */
export const buildEditPayload = (
  type: string,
  f: EventTypeFields,
  stored: StoredPayload,
): Record<string, O.Option<unknown>> => {
  const out: Record<string, O.Option<unknown>> = {};
  const set = (key: string, value: unknown): void => {
    if (value !== undefined) out[key] = O.some(value);
  };

  switch (type) {
    case "Death":
      set("victim", f.victim);
      set("location", f.location);
      break;
    case "Quote":
      set("actor", f.actor);
      set("quote", f.quote);
      set("details", f.details);
      set("subject", f.subject);
      break;
    case "Transaction":
      set("title", f.title);
      set("total", f.total);
      set("currency", f.currency);
      set("from", f.from);
      set("to", f.to);
      break;
    case "ScientificStudy":
      set("title", f.title);
      set("url", f.url);
      set("image", f.image);
      set("authors", f.studyAuthors);
      set("publisher", f.studyPublisher);
      break;
    case "Book": {
      set("title", f.title);
      if (f.pdf !== undefined || f.audio !== undefined) {
        const media = nested(stored, "media");
        set("media", {
          ...media,
          ...(f.pdf !== undefined ? { pdf: f.pdf } : {}),
          ...(f.audio !== undefined ? { audio: f.audio } : {}),
        });
      }
      set("authors", f.authors);
      set("publisher", f.publisher);
      break;
    }
    case "Patent": {
      set("title", f.title);
      if (f.ownerActors !== undefined || f.ownerGroups !== undefined) {
        const owners = nested(stored, "owners");
        set("owners", {
          actors: f.ownerActors ?? owners.actors ?? [],
          groups: f.ownerGroups ?? owners.groups ?? [],
        });
      }
      set("source", f.source);
      break;
    }
    case "Documentary": {
      set("title", f.title);
      set("media", f.documentaryMedia);
      set("website", f.website);
      if (f.authorActors !== undefined || f.authorGroups !== undefined) {
        const authors = nested(stored, "authors");
        set("authors", {
          actors: f.authorActors ?? authors.actors ?? [],
          groups: f.authorGroups ?? authors.groups ?? [],
        });
      }
      if (f.subjectActors !== undefined || f.subjectGroups !== undefined) {
        const subjects = nested(stored, "subjects");
        set("subjects", {
          actors: f.subjectActors ?? subjects.actors ?? [],
          groups: f.subjectGroups ?? subjects.groups ?? [],
        });
      }
      break;
    }
    case "Uncategorized":
    default:
      set("title", f.title);
      set("actors", f.actors);
      set("groups", f.groups);
      set("groupsMembers", f.groupsMembers);
      set("location", f.location);
      set("endDate", toDate(f.endDate));
      break;
  }

  return out;
};
