import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";

export const FindEventsInputSchema = Schema.Struct({
  query: Schema.UndefinedOr(Schema.String).annotations({
    description: "Full-text search query",
  }),
  actors: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Filter by actor UUIDs",
  }),
  groups: Schema.UndefinedOr(Schema.Array(UUID)).annotations({
    description: "Filter by group UUIDs",
  }),
  type: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Filter by event type: Death, ScientificStudy, Patent, Documentary, Transaction, Book, Quote, Uncategorized",
  }),
  startDate: Schema.UndefinedOr(Schema.String).annotations({
    description: "Filter events on or after this date (YYYY-MM-DD)",
  }),
  endDate: Schema.UndefinedOr(Schema.String).annotations({
    description: "Filter events on or before this date (YYYY-MM-DD)",
  }),
  start: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination offset (default: 0)",
  }),
  end: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Pagination limit (default: 20)",
  }),
});

export const GetEventInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the event to retrieve",
  }),
});

/**
 * Input schema for creating an event via CLI.
 * type determines which payload fields are required.
 *
 * Supported types and their required payload fields:
 *   Uncategorized  – title, actors?, groups?, groupsMembers?, location?, endDate?
 *   Death          – victim (actor UUID), location?
 *   Quote          – actor?, quote?, details?
 *   Transaction    – title, total, currency, fromType, fromId, toType, toId
 *   ScientificStudy – title, url (link UUID), image?, publisher?, authors?
 *   Book           – title, pdf (media UUID), audio?, authors (comma-sep UUIDs), publisher?
 *   Patent         – title, ownerActors?, ownerGroups?, source?
 *   Documentary    – title, media (UUID), website?, authorActors?, authorGroups?, subjectActors?, subjectGroups?
 */
export const CreateEventInputSchema = Schema.Struct({
  type: Schema.Union(
    Schema.Literal("Uncategorized"),
    Schema.Literal("Death"),
    Schema.Literal("Quote"),
    Schema.Literal("Transaction"),
    Schema.Literal("ScientificStudy"),
    Schema.Literal("Book"),
    Schema.Literal("Patent"),
    Schema.Literal("Documentary"),
  ).annotations({
    description:
      "Event type (required): Uncategorized | Death | Quote | Transaction | ScientificStudy | Book | Patent | Documentary",
  }),
  date: Schema.DateFromString.annotations({
    description: "Event date (required) YYYY-MM-DD",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Draft flag (default: false)",
  }),
  excerpt: Schema.UndefinedOr(Schema.String).annotations({
    description: "Short excerpt text",
  }),
  // common relations
  links: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated link UUIDs",
  }),
  media: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated media UUIDs",
  }),
  keywords: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated keyword UUIDs",
  }),
  // Uncategorized / Death / Quote / etc. payloads
  title: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Event title (required for Uncategorized, Transaction, ScientificStudy, Book, Patent, Documentary)",
  }),
  actors: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated actor UUIDs (Uncategorized payload)",
  }),
  groups: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated group UUIDs (Uncategorized payload)",
  }),
  groupsMembers: Schema.UndefinedOr(UUID).annotations({
    description: "Comma-separated group-member UUIDs (Uncategorized payload)",
  }),
  location: Schema.UndefinedOr(UUID).annotations({
    description: "Area UUID for event location (Uncategorized/Death payload)",
  }),
  endDate: Schema.UndefinedOr(Schema.DateFromString).annotations({
    description: "End date YYYY-MM-DD (Uncategorized payload)",
  }),
  // Death payload
  victim: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID of the victim (Death payload, required)",
  }),
  // Quote payload
  actor: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID who made the quote (Quote payload)",
  }),
  quote: Schema.UndefinedOr(Schema.String).annotations({
    description: "Quote text (Quote payload)",
  }),
  details: Schema.UndefinedOr(Schema.String).annotations({
    description: "Additional details (Quote payload)",
  }),
  // Transaction payload
  total: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Transaction total amount (Transaction payload)",
  }),
  currency: Schema.UndefinedOr(Schema.String).annotations({
    description: "Currency code e.g. USD (Transaction payload)",
  }),
  fromType: Schema.UndefinedOr(Schema.String).annotations({
    description: "Sender subject type: actor | group (Transaction payload)",
  }),
  fromId: Schema.UndefinedOr(UUID).annotations({
    description: "Sender subject UUID (Transaction payload)",
  }),
  toType: Schema.UndefinedOr(Schema.String).annotations({
    description: "Recipient subject type: actor | group (Transaction payload)",
  }),
  toId: Schema.UndefinedOr(UUID).annotations({
    description: "Recipient subject UUID (Transaction payload)",
  }),
  // ScientificStudy payload
  studyUrl: Schema.UndefinedOr(UUID).annotations({
    description:
      "Link UUID for the study URL (ScientificStudy payload, required)",
  }),
  image: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for the study image (ScientificStudy payload)",
  }),
  publisher: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID of the publisher (ScientificStudy/Book payload)",
  }),
  authors: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Comma-separated actor UUIDs of authors (ScientificStudy/Book payload)",
  }),
  // Book payload
  pdf: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for the PDF (Book payload, required)",
  }),
  audio: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for audio version (Book payload)",
  }),
  // Patent payload
  ownerActors: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Comma-separated actor UUIDs as patent owners (Patent payload)",
  }),
  ownerGroups: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Comma-separated group UUIDs as patent owners (Patent payload)",
  }),
  source: Schema.UndefinedOr(UUID).annotations({
    description: "Link UUID as patent source (Patent payload)",
  }),
  // Documentary payload
  documentaryMedia: Schema.UndefinedOr(UUID).annotations({
    description:
      "Media UUID for the documentary (Documentary payload, required)",
  }),
  website: Schema.UndefinedOr(UUID).annotations({
    description: "Link UUID for the documentary website (Documentary payload)",
  }),
  authorActors: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Comma-separated actor UUIDs as documentary authors (Documentary payload)",
  }),
  authorGroups: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Comma-separated group UUIDs as documentary authors (Documentary payload)",
  }),
  subjectActors: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Comma-separated actor UUIDs as documentary subjects (Documentary payload)",
  }),
  subjectGroups: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Comma-separated group UUIDs as documentary subjects (Documentary payload)",
  }),
});

export type CreateEventInputSchema = typeof CreateEventInputSchema.Type;

export const EditEventInputSchema = Schema.Struct({
  id: UUID.annotations({
    description: "UUID of the event to edit (required)",
  }),
  type: Schema.Union(
    Schema.Literal("Uncategorized"),
    Schema.Literal("Death"),
    Schema.Literal("Quote"),
    Schema.Literal("Transaction"),
    Schema.Literal("ScientificStudy"),
    Schema.Literal("Book"),
    Schema.Literal("Patent"),
    Schema.Literal("Documentary"),
  ).annotations({
    description:
      "Event type (required for edit): Uncategorized | Death | Quote | Transaction | ScientificStudy | Book | Patent | Documentary",
  }),
  date: Schema.UndefinedOr(Schema.DateFromString).annotations({
    description: "Event date YYYY-MM-DD",
  }),
  draft: Schema.UndefinedOr(Schema.BooleanFromString).annotations({
    description: "Draft flag",
  }),
  excerpt: Schema.UndefinedOr(Schema.String).annotations({
    description: "Short excerpt text",
  }),
  links: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated link UUIDs",
  }),
  media: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated media UUIDs",
  }),
  keywords: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated keyword UUIDs",
  }),
  title: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Event title (Uncategorized/Transaction/ScientificStudy/Book/Patent/Documentary)",
  }),
  actors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs (Uncategorized payload)",
  }),
  groups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs (Uncategorized payload)",
  }),
  groupsMembers: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group-member UUIDs (Uncategorized payload)",
  }),
  location: Schema.UndefinedOr(UUID).annotations({
    description: "Area UUID for event location",
  }),
  endDate: Schema.UndefinedOr(Schema.DateFromString).annotations({
    description: "End date YYYY-MM-DD (Uncategorized payload)",
  }),
  victim: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID of the victim (Death payload)",
  }),
  actor: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID who made the quote (Quote payload)",
  }),
  quote: Schema.UndefinedOr(Schema.String).annotations({
    description: "Quote text (Quote payload)",
  }),
  details: Schema.UndefinedOr(Schema.String).annotations({
    description: "Additional details (Quote payload)",
  }),
  total: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Transaction total amount",
  }),
  currency: Schema.UndefinedOr(Schema.String).annotations({
    description: "Currency code (Transaction payload)",
  }),
  fromType: Schema.UndefinedOr(Schema.String).annotations({
    description: "Sender subject type: actor | group (Transaction payload)",
  }),
  fromId: Schema.UndefinedOr(UUID).annotations({
    description: "Sender subject UUID (Transaction payload)",
  }),
  toType: Schema.UndefinedOr(Schema.String).annotations({
    description: "Recipient subject type: actor | group (Transaction payload)",
  }),
  toId: Schema.UndefinedOr(UUID).annotations({
    description: "Recipient subject UUID (Transaction payload)",
  }),
  studyUrl: Schema.UndefinedOr(UUID).annotations({
    description: "Link UUID for the study URL (ScientificStudy payload)",
  }),
  image: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID (ScientificStudy payload)",
  }),
  publisher: Schema.UndefinedOr(UUID).annotations({
    description: "Actor UUID of the publisher (ScientificStudy/Book payload)",
  }),
  authors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs of authors",
  }),
  pdf: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for the PDF (Book payload)",
  }),
  audio: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for audio (Book payload)",
  }),
  ownerActors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs as patent owners",
  }),
  ownerGroups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs as patent owners",
  }),
  source: Schema.UndefinedOr(UUID).annotations({
    description: "Link UUID as patent source",
  }),
  documentaryMedia: Schema.UndefinedOr(UUID).annotations({
    description: "Media UUID for the documentary",
  }),
  website: Schema.UndefinedOr(UUID).annotations({
    description: "Link UUID for the documentary website",
  }),
  authorActors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs as documentary authors",
  }),
  authorGroups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs as documentary authors",
  }),
  subjectActors: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated actor UUIDs as documentary subjects",
  }),
  subjectGroups: Schema.UndefinedOr(Schema.String).annotations({
    description: "Comma-separated group UUIDs as documentary subjects",
  }),
});

export type EditEventInputSchema = typeof EditEventInputSchema.Type;
