  1. Extend command.type.ts

  export interface CommandGroup {
    description: string;
    commands: Record<string, CommandModule | CommandGroup>;
  }

  Add a type guard isCommandGroup(c): c is CommandGroup used by the dispatcher.

  ---
  2. Update CLI dispatcher (cli.ts)

  The current dispatcher resolves group → command. Extend it to resolve group → sub-group → command, handling one extra level of nesting. The --help at the sub-group level should list its commands.

  ---
  3. Base schema

  services/agent/src/cli/events/schemas/base.schema.ts

  Shared fields across all types:
  - date: Schema.DateFromString (required for create, optional for edit)
  - draft: Schema.optional(Schema.BooleanFromString)
  - excerpt: Schema.optional(Schema.String)
  - links: Schema.optional(Schema.String) — comma-separated UUIDs
  - media: Schema.optional(Schema.String)
  - keywords: Schema.optional(Schema.String)

  Two variants: EventCreateBaseSchema (date required) and EventEditBaseSchema (date optional + id: UUID).

  ---
  4. Per-type schemas

  One file per type in events/schemas/. Each uses Schema.Struct({ ...BaseSchema.fields, ...payloadFields }):

  ┌─────────────────┬────────────────────────────────────────────────────────────────────────────────────────────┐
  │      Type       │                                        Extra fields                                        │
  ├─────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Uncategorized   │ title, actors, groups, groupsMembers, location, endDate                                    │
  ├─────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Death           │ victim (required UUID), location                                                           │
  ├─────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Quote           │ actor, quote, details                                                                      │
  ├─────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Transaction     │ title, total (NumberFromString), currency, fromType, fromId, toType, toId                  │
  ├─────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
  │ ScientificStudy │ title, studyUrl, image, publisher, authors                                                 │
  ├─────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Book            │ title, pdf, audio, authors, publisher                                                      │
  ├─────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Patent          │ title, ownerActors, ownerGroups, source                                                    │
  ├─────────────────┼────────────────────────────────────────────────────────────────────────────────────────────┤
  │ Documentary     │ title, documentaryMedia, website, authorActors, authorGroups, subjectActors, subjectGroups │
  └─────────────────┴────────────────────────────────────────────────────────────────────────────────────────────┘

  ---
  5. Per-type command files

  events/types/<type>.create.ts and events/types/<type>.edit.ts — each uses makeCommand(TypeSchema, meta, handler). The handler contains only the logic for that type (no switch, no conditional payload building).

  Required validations that were previously runtime checks (e.g. --victim required for Death) become schema-level required fields — no more manual if (!input.victim) return TE.left(...).

  ---
  6. Updated events/index.ts

  export const eventGroup: CommandGroup = {
    description: "Manage fact-checked events",
    commands: {
      list: eventList,
      get: eventGet,
      uncategorized: { description: "...", commands: { create: ..., edit: ... } },
      death:         { description: "...", commands: { create: ..., edit: ... } },
      quote:         { description: "...", commands: { create: ..., edit: ... } },
      transaction:   { description: "...", commands: { create: ..., edit: ... } },
      "scientific-study": { ... },
      book:          { ... },
      patent:        { ... },
      documentary:   { ... },
    },
  };

  ---
  7. Delete

  - events/create.ts
  - events/edit.ts
  - The EVENT_CREATE_NOTES / EVENT_EDIT_NOTES manual help strings (replaced by schema-derived help)

  ---
  Requirements to meet

  1. CommandGroup.commands accepts both CommandModule and CommandGroup (nested)
  2. CLI dispatcher handles 3-level routing: group → sub-group → command
  3. --help at the sub-group level lists available sub-commands
  4. Required payload fields enforced by schema (not runtime if checks) — decode errors surface the same way as today
  5. Shared base fields defined once, spread into per-type schemas — no duplication
  6. makeCommand used for every leaf command — no manual arg parsing
  7. Old monolithic create.ts / edit.ts fully removed