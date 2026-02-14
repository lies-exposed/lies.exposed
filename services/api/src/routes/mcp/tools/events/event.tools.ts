import {
  CREATE_BOOK_EVENT,
  CREATE_DEATH_EVENT,
  CREATE_DOCUMENTARY_EVENT,
  CREATE_PATENT_EVENT,
  CREATE_QUOTE_EVENT,
  CREATE_SCIENTIFIC_STUDY_EVENT,
  CREATE_EVENT,
  EDIT_EVENT,
  CREATE_TRANSACTION_EVENT,
  CREATE_UNCATEGORIZED_EVENT,
  FIND_EVENTS,
  GET_EVENT,
} from "@liexp/backend/lib/providers/ai/toolNames.constants.js";
import { throwRTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { effectToZodStruct } from "@liexp/shared/lib/utils/schema.utils.js";
import { type McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { flow, pipe } from "fp-ts/lib/function.js";
import { type ServerContext } from "../../../../context/context.type.js";
import {
  CreateBookEventInputSchema,
  createBookEventToolTask,
} from "./createBookEvent.tool.js";
import {
  CreateDeathEventInputSchema,
  createDeathEventToolTask,
} from "./createDeathEvent.tool.js";
import {
  CreateDocumentaryEventInputSchema,
  createDocumentaryEventToolTask,
} from "./createDocumentaryEvent.tool.js";
import {
  CreatePatentEventInputSchema,
  createPatentEventToolTask,
} from "./createPatentEvent.tool.js";
import {
  CreateQuoteEventInputSchema,
  createQuoteEventToolTask,
} from "./createQuoteEvent.tool.js";
import {
  CreateScientificStudyEventInputSchema,
  createScientificStudyEventToolTask,
} from "./createScientificStudyEvent.tool.js";
import {
  CreateTransactionEventInputSchema,
  createTransactionEventToolTask,
} from "./createTransactionEvent.tool.js";
import {
  CreateUncategorizedEventInputSchema,
  createUncategorizedEventToolTask,
} from "./createUncategorizedEvent.tool.js";
import {
  CreateUnifiedEventInputSchema,
  createUnifiedEventToolTask,
} from "./createUnifiedEvent.tool.js";
import { EditEventInputSchema, editEventToolTask } from "./editEvent.tool.js";
import {
  FindEventsInputSchema,
  findEventsToolTask,
} from "./findEvents.tool.js";
import { GetEventInputSchema, getEventToolTask } from "./getEvent.tool.js";

export const registerEventTools = (server: McpServer, ctx: ServerContext) => {
  server.registerTool(
    FIND_EVENTS,
    {
      title: "Find events",
      description:
        "Search for events using various criteria like title, keywords, actor and group ids. Use this tool to check if a similar event already exists before creating a new one. Returns the story in JSON format.",
      annotations: { title: "Find events" },
      inputSchema: effectToZodStruct(FindEventsInputSchema),
    },
    flow(findEventsToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    GET_EVENT,
    {
      title: "Get event",
      description: "Get an event by its ID. Returns the event in JSON format",
      annotations: { title: "Get event" },
      inputSchema: effectToZodStruct(GetEventInputSchema),
    },
    flow(getEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_EVENT,
    {
      title: "Create event (unified)",
      description: `RECOMMENDED: Create any event type using a single unified tool with type discrimination.

This unified tool consolidates 8 specialized event creation tools into one consistent interface.
Use this tool instead of createBookEvent, createQuoteEvent, etc. for consistency and clarity.

WORKFLOW:
1. Search for actors and groups using findActors/findGroups FIRST
2. Select the event type (Book, Quote, Death, Patent, etc.)
3. Provide type-specific payload fields + base event fields
4. Use found IDs from search results only

SUPPORTED EVENT TYPES:
- Book: For published books with authors/publishers
- Death: For death events with victim actor
- Patent: For patents with owners
- ScientificStudy: For research papers/academic studies
- Uncategorized: For general events with actors/groups
- Documentary: For films/videos with directors
- Transaction: For financial transactions
- Quote: For quotes/statements by actors

EXAMPLE - Create a Book Event:
{
  "type": "Book",
  "date": "2024-01-15",
  "draft": false,
  "payload": {
    "type": "Book",
    "title": "The Great Book",
    "pdfMediaId": "media-uuid",
    "audioMediaId": null,
    "authors": [{"type": "Actor", "id": "author-uuid"}],
    "publisher": {"type": "Group", "id": "publisher-uuid"}
  },
  "excerpt": "A fascinating book",
  "body": null,
  "media": ["media-uuid"],
  "links": [],
  "keywords": []
}

EXAMPLE - Create a Quote Event:
{
  "type": "Quote",
  "date": "2024-02-15",
  "draft": false,
  "payload": {
    "type": "Quote",
    "quote": "We must act on climate change",
    "actor": "actor-uuid",
    "subject": null,
    "details": "Said during press conference"
  },
  "excerpt": "Climate statement",
  "body": null,
  "media": [],
  "links": [],
  "keywords": []
}

KEY ADVANTAGES:
- Single tool signature for all event types
- Type-safe discriminated union
- Consistent error messages
- Same pattern as editEvent tool
- Reduces LLM confusion from 8 different tools
- Stay under 25 recursion limit with unified workflow

IMPORTANT NOTES:
- payload.type must match the top-level type field
- Search for entities BEFORE creating
- Only use IDs from search results
- Empty arrays acceptable for optional fields
- Use null for optional singular values (not undefined)`,
      annotations: { title: "Create event (unified)" },
      inputSchema: effectToZodStruct(CreateUnifiedEventInputSchema),
    },
    flow(createUnifiedEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_UNCATEGORIZED_EVENT,
    {
      title: "Create uncategorized event",
      description: `⚠️ DEPRECATED: Use createEvent (unified) tool instead for consistency.

Create a new uncategorized event - a general factual occurrence with associated actors, groups, media, and links.

WORKFLOW:
1. Use findActors to search for and collect actor IDs (try multiple name variations)
2. Use findGroups to search for and collect group/organization IDs
3. Use findMedia to find or uploadMediaFromURL for media files
4. Create the event with collected IDs, leaving empty arrays for entities not found

IMPORTANT: 
- Search BEFORE creating - avoid duplicates by checking findEvents first
- Only use existing IDs from search results - do NOT create new actors/groups
- Empty arrays are acceptable if no matches found
- Be efficient: search once, reuse results to stay under 25 recursion limit

EXAMPLE:
{
  "date": "2024-01-15",
  "draft": false,
  "title": "Major Political Meeting",
  "actors": ["actor-uuid-1", "actor-uuid-2"],
  "groups": ["group-uuid-1"],
  "groupsMembers": [],
  "location": "area-uuid-1",
  "endDate": "2024-01-16",
  "excerpt": "A significant political event",
  "body": null,
  "media": [],
  "links": [],
  "keywords": []
}`,
      annotations: { title: "Create uncategorized event" },
      inputSchema: effectToZodStruct(CreateUncategorizedEventInputSchema),
    },
    (input) =>
      pipe(
        createUncategorizedEventToolTask({
          ...input,
          location: input.location ?? undefined,
          endDate: input.endDate ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    CREATE_BOOK_EVENT,
    {
      title: "Create book event",
      description: `⚠️ DEPRECATED: Use createEvent (unified) tool instead for consistency.

Create a new book event in the database. Book events represent published books with authors, publishers, and associated media (PDF, audio).

WORKFLOW:
1. Search for authors using findActors with author names
2. Search for publisher using findGroups with organization name
3. Upload or find PDF/audio media using uploadMediaFromURL or findMedia
4. Create the event with found IDs only

IMPORTANT NOTES:
- ONLY use existing IDs from search results - do NOT create new actors/groups inside this tool
- Empty arrays for authors are acceptable if none found
- Set publisher to null if no publisher found
- Be efficient with tool calls to stay under 25 recursion limit

EXAMPLE minimal book event:
{
  "date": "2024-01-15",
  "draft": false,
  "title": "The Great Book",
  "pdfMediaId": "media-uuid-1",
  "audioMediaId": null,
  "authors": [
    {"type": "Actor", "id": "actor-uuid-1"},
    {"type": "Actor", "id": "actor-uuid-2"}
  ],
  "publisher": {"type": "Group", "id": "group-uuid-1"},
  "excerpt": "A fascinating exploration of...",
  "body": null,
  "media": ["media-uuid-1"],
  "links": [],
  "keywords": []
}`,
      annotations: { title: "Create book event" },
      inputSchema: effectToZodStruct(CreateBookEventInputSchema),
    },
    flow(createBookEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_QUOTE_EVENT,
    {
      title: "Create quote event",
      description: `⚠️ DEPRECATED: Use createEvent (unified) tool instead for consistency.

Create a quote event representing statements or quotes made by actors.

WORKFLOW:
1. Search for the quote author using findActors
2. Search for the quote subject (if applicable) using findActors or findGroups
3. Create event with found IDs

EXAMPLE:
{
  "date": "2024-01-15",
  "draft": false,
  "quote": "We must act on climate change.",
  "actor": "actor-uuid-1",
  "subject": {"type": "Group", "id": "group-uuid-1"},
  "details": "Said during a press conference",
  "excerpt": "Climate change statement",
  "body": null,
  "media": [],
  "links": [],
  "keywords": []
}

NOTES:
- actor: UUID of person who made the quote
- subject: Optional - what the quote is about (Actor or Group)
- Empty arrays OK for media, links, keywords`,
      annotations: { title: "Create quote event" },
      inputSchema: effectToZodStruct(CreateQuoteEventInputSchema),
    },
    flow(createQuoteEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_PATENT_EVENT,
    {
      title: "Create patent event",
      description: `⚠️ DEPRECATED: Use createEvent (unified) tool instead for consistency.

Create a patent event representing registered patents with owners (actors and/or groups).

WORKFLOW:
1. Search for patent owners using findActors and findGroups
2. Collect owner UUIDs from search results
3. Create patent event with found IDs

NESTED OWNER FORMAT:
Each owner must have:
{
  "type": "Actor" or "Group",
  "id": "uuid"
}

EXAMPLE:
{
  "date": "2024-03-20",
  "draft": false,
  "title": "Novel Medical Device Patent",
  "owners": [
    {"type": "Actor", "id": "inventor-uuid"},
    {"type": "Group", "id": "company-uuid"}
  ],
  "source": "Patent office filing number XYZ123",
  "excerpt": "A revolutionary patent for...",
  "body": null,
  "media": [],
  "links": [],
  "keywords": []
}

NOTES:
- Empty owners array is acceptable if none found
- source: Patent filing reference information
- Be efficient with searches to stay under 25 recursion limit`,
      annotations: { title: "Create patent event" },
      inputSchema: effectToZodStruct(CreatePatentEventInputSchema),
    },
    flow(createPatentEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_SCIENTIFIC_STUDY_EVENT,
    {
      title: "Create scientific study event",
      description: `⚠️ DEPRECATED: Use createEvent (unified) tool instead for consistency.

Create a scientific study event representing published research papers, clinical trials, or academic papers.

CRITICAL WORKFLOW - ALWAYS FOLLOW THIS PATTERN:
1. Search for each author: findActors with author names (try variations)
2. Search for publisher: findGroups with organization name
3. Upload or find research image: uploadMediaFromURL with study image URL
4. Create event with found IDs ONLY - do NOT create new actors/groups

NESTED OBJECT FORMAT - Each author must have this structure:
{
  "type": "Actor" or "Group",  <- Literal value, must match exactly
  "id": "uuid-string"          <- UUID of the actor or group found in search
}

EXAMPLE - Proper nested structure:
{
  "date": "2024-06-15",
  "draft": false,
  "title": "COVID-19 Vaccine Efficacy Study",
  "url": "https://example.com/study",
  "image": "media-uuid-1",
  "authors": [
    {"type": "Actor", "id": "actor-uuid-1"},
    {"type": "Actor", "id": "actor-uuid-2"}
  ],
  "publisher": {"type": "Group", "id": "group-uuid-1"},
  "excerpt": "A comprehensive study of...",
  "body": null,
  "media": ["media-uuid-1"],
  "links": [],
  "keywords": []
}

IMPORTANT NOTES:
- Empty author array is OK if no authors found in search
- Set publisher to null if no publisher found
- Do NOT try to create actors/groups as nested objects
- Be efficient with tool calls - stay under 25 recursion limit
- Only use IDs from search results, NEVER guess UUIDs`,
      annotations: { title: "Create scientific study event" },
      inputSchema: effectToZodStruct(CreateScientificStudyEventInputSchema),
    },
    (input) =>
      pipe(
        createScientificStudyEventToolTask({
          ...input,
          image: input.image ?? undefined,
          publisher: input.publisher ?? undefined,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    EDIT_EVENT,
    {
      title: "Edit event",
      description:
        "Edit an existing event. Provide the event `id`, the event `type` (discriminator), base fields (date, draft, excerpt, body, media, links, keywords) and a type-specific `payload`. IMPORTANT: Use findActors/findGroups to resolve IDs for actors/groups and avoid creating new actors inside this tool. It's acceptable to leave actors/groups/keywords empty. Keep tool calls efficient to remain under the 25 recursion limit.",
      annotations: { title: "Edit event" },
      inputSchema: effectToZodStruct(EditEventInputSchema),
    },
    ({
      date,
      draft,
      excerpt,
      body,
      media,
      links,
      keywords,
      payload,
      ...input
    }) =>
      pipe(
        editEventToolTask({
          ...input,
          draft,
          date: date ?? undefined,
          excerpt,
          body,
          media,
          links,
          keywords,
          payload,
        }),
        throwRTE(ctx),
      ),
  );

  server.registerTool(
    CREATE_DEATH_EVENT,
    {
      title: "Create death event",
      description: `⚠️ DEPRECATED: Use createEvent (unified) tool instead for consistency.

Create a death event representing the death of an actor at a specific location and date.

WORKFLOW:
1. Search for the deceased actor using findActors
2. Search for the location (if known) using findAreas
3. Create death event with found IDs

EXAMPLE:
{
  "date": "2024-01-25",
  "draft": false,
  "victim": "actor-uuid-1",
  "location": "area-uuid-1",
  "causes": ["cause-uuid-1"],
  "excerpt": "Notable person passed away",
  "body": null,
  "media": [],
  "links": [],
  "keywords": []
}

NOTES:
- victim: Required UUID of the actor who passed away
- location: Optional area UUID where death occurred
- causes: Optional array of cause UUIDs (e.g., illness, accident)
- Search for victim BEFORE creating event`,
      annotations: { title: "Create death event" },
      inputSchema: effectToZodStruct(CreateDeathEventInputSchema),
    },
    flow(createDeathEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_DOCUMENTARY_EVENT,
    {
      title: "Create documentary event",
      description: `⚠️ DEPRECATED: Use createEvent (unified) tool instead for consistency.

Create a documentary event representing documentary films or video productions.

WORKFLOW:
1. Search for directors/creators using findActors
2. Search for production companies using findGroups
3. Search for documentary subjects/topics using findActors/findGroups
4. Create event with found IDs

NESTED AUTHOR FORMAT:
{
  "type": "Actor" or "Group",
  "id": "uuid"
}

EXAMPLE:
{
  "date": "2023-11-10",
  "draft": false,
  "title": "The Documentary Title",
  "website": "https://example.com/documentary",
  "authors": [
    {"type": "Actor", "id": "director-uuid"}
  ],
  "subjects": [
    {"type": "Group", "id": "organization-uuid"}
  ],
  "excerpt": "A documentary about...",
  "body": null,
  "media": [],
  "links": [],
  "keywords": []
}

NOTES:
- authors: Directors/creators of the documentary
- subjects: What the documentary is about
- Empty arrays acceptable if entities not found in search
- Only use IDs from search results`,
      annotations: { title: "Create documentary event" },
      inputSchema: effectToZodStruct(CreateDocumentaryEventInputSchema),
    },
    flow(createDocumentaryEventToolTask, throwRTE(ctx)),
  );

  server.registerTool(
    CREATE_TRANSACTION_EVENT,
    {
      title: "Create transaction event",
      description: `⚠️ DEPRECATED: Use createEvent (unified) tool instead for consistency.

Create a transaction event representing financial transactions between entities (actors or groups).

WORKFLOW:
1. Search for 'from' entity (payer) using findActors/findGroups
2. Search for 'to' entity (recipient) using findActors/findGroups
3. Verify both entities exist before creating
4. Create transaction event with found IDs

NESTED ENTITY FORMAT:
{
  "type": "Actor" or "Group",
  "id": "uuid"
}

EXAMPLE:
{
  "date": "2024-02-15",
  "draft": false,
  "title": "Payment from Company A to Company B",
  "total": 1500000,
  "currency": "USD",
  "from": {"type": "Group", "id": "company-a-uuid"},
  "to": {"type": "Group", "id": "company-b-uuid"},
  "excerpt": "Major financial transaction",
  "body": null,
  "media": [],
  "links": [],
  "keywords": []
}

NOTES:
- total: Transaction amount (numeric)
- currency: ISO currency code (USD, EUR, GBP, etc.)
- from: Who paid/sent (Actor or Group)
- to: Who received (Actor or Group)
- Verify both entities exist before creating
- Use only IDs from search results`,
      annotations: { title: "Create transaction event" },
      inputSchema: effectToZodStruct(CreateTransactionEventInputSchema),
    },
    flow(createTransactionEventToolTask, throwRTE(ctx)),
  );
};
