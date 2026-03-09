import { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { Schema } from "effect";
import { EventCreateBaseSchema, EventEditBaseSchema } from "./base.schema.js";

const transactionPartyFields = {
  fromType: Schema.Literal("Actor", "Group").annotations({
    description: 'Sender type: "Actor" or "Group"',
  }),
  fromId: UUID.annotations({
    description: "Sender UUID (required)",
  }),
  toType: Schema.Literal("Actor", "Group").annotations({
    description: 'Recipient type: "Actor" or "Group"',
  }),
  toId: UUID.annotations({
    description: "Recipient UUID (required)",
  }),
};

export const CreateTransactionEventSchema = Schema.Struct({
  ...EventCreateBaseSchema.fields,
  title: Schema.String.annotations({
    description: "Transaction title (required)",
  }),
  total: Schema.NumberFromString.annotations({
    description: "Amount (required)",
  }),
  currency: Schema.String.annotations({
    description: "Currency code e.g. USD (required)",
  }),
  ...transactionPartyFields,
});

export const EditTransactionEventSchema = Schema.Struct({
  ...EventEditBaseSchema.fields,
  title: Schema.UndefinedOr(Schema.String).annotations({
    description: "Transaction title",
  }),
  total: Schema.UndefinedOr(Schema.NumberFromString).annotations({
    description: "Amount",
  }),
  currency: Schema.UndefinedOr(Schema.String).annotations({
    description: "Currency code e.g. USD",
  }),
  fromType: Schema.UndefinedOr(Schema.Literal("Actor", "Group")).annotations({
    description: 'Sender type: "Actor" or "Group"',
  }),
  fromId: Schema.UndefinedOr(UUID).annotations({
    description: "Sender UUID",
  }),
  toType: Schema.UndefinedOr(Schema.Literal("Actor", "Group")).annotations({
    description: 'Recipient type: "Actor" or "Group"',
  }),
  toId: Schema.UndefinedOr(UUID).annotations({
    description: "Recipient UUID",
  }),
});
