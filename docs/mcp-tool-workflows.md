# MCP Tool Workflows - Common Patterns

This guide demonstrates the recommended workflows for using MCP tools effectively. These patterns keep you under the 25 tool recursion limit and avoid creating duplicate entities.

## 🎯 General Principles

1. **ALWAYS Search Before Creating**: Avoid duplicates by searching first
2. **Reuse IDs**: Search once, collect IDs, create once
3. **Accept Empty Results**: It's OK to create events with empty actor/group arrays
4. **Batch Operations**: Combine multiple search operations efficiently

---

## Workflow 1: Creating an Event with Actors and Groups

**Goal**: Create a story/event with specific people and organizations

### Step 1: Search for Actors
```
findActors({ fullName: "Event Organizer Name" })
→ Returns: [{ id: "actor-uuid-1", ... }]

findActors({ fullName: "Keynote Speaker" })
→ Returns: [{ id: "actor-uuid-2", ... }]
```

**Alternative searches to try:**
- Different name variations: "John Smith", "Johnny", "J. Smith"
- Search multiple people in parallel

### Step 2: Search for Groups
```
findGroups({ name: "Hosting Organization" })
→ Returns: [{ id: "group-uuid-1", ... }]
```

**Alternative searches to try:**
- Acronyms: "WHO" for "World Health Organization"
- Short forms: "EU" for "European Union"
- Partial names: "Health" for "World Health Organization"

### Step 3: Create the Event
With collected IDs:
```json
{
  "type": "uncategorized",
  "date": "2024-01-15",
  "title": "International Climate Summit",
  "actors": ["actor-uuid-1", "actor-uuid-2"],
  "groups": ["group-uuid-1"],
  "draft": false
}
```

**If no matches found:**
```json
{
  "type": "uncategorized",
  "date": "2024-01-15",
  "title": "International Climate Summit",
  "actors": [],  // Still OK to create!
  "groups": [],
  "draft": false
}
```

---

## Workflow 2: Creating a Book Event

**Goal**: Document a published book with authors and publisher

### Pattern: 3 Search Operations → 1 Create

```
Step 1: Search for authors
findActors({ fullName: "Author Name" }) → [{ id: "author-uuid" }]
findActors({ fullName: "Another Author" }) → [{ id: "author-uuid-2" }]

Step 2: Search for publisher
findGroups({ name: "Publisher Name" }) → [{ id: "publisher-uuid" }]

Step 3: Get or upload book cover
uploadMediaFromURL({ url: "cover.jpg", type: "image" }) → { id: "media-uuid" }

Step 4: Create book event
{
  "date": "2023-06-15",
  "title": "The Great Book",
  "pdfMediaId": "media-uuid",
  "authors": [
    {"type": "Actor", "id": "author-uuid"},
    {"type": "Actor", "id": "author-uuid-2"}
  ],
  "publisher": {"type": "Group", "id": "publisher-uuid"}
}
```

**Quick Tip**: Empty author/publisher arrays are OK
```json
{
  "authors": [],
  "publisher": null
}
```

---

## Workflow 3: Creating a Scientific Study Event

**Goal**: Document research paper with authors and publisher

### Pattern: Search & Create with Nested Objects

```
Step 1: Search for authors
findActors({ fullName: "Dr. Jane Smith" }) → found
findActors({ fullName: "Dr. John Doe" }) → found
findActors({ fullName: "Anonymous Researcher" }) → NOT found

Step 2: Search for publisher (journal/institution)
findGroups({ name: "Nature Journal" }) → found

Step 3: Get study image (optional)
uploadMediaFromURL({ url: "study-thumbnail.jpg" }) → { id: "image-uuid" }

Step 4: Create study event with collected IDs
{
  "date": "2024-02-10",
  "title": "COVID-19 Vaccine Safety Analysis",
  "url": "https://example.com/study",
  "image": "image-uuid",
  "authors": [
    {"type": "Actor", "id": "jane-smith-uuid"},
    {"type": "Actor", "id": "john-doe-uuid"}
  ],
  "publisher": {"type": "Group", "id": "journal-uuid"}
}
```

---

## Workflow 4: Creating an Actor

**Goal**: Add a person to the database

### Pattern: Multiple Search Variations → Create

```
Step 1: Search with multiple name variations
findActors({ fullName: "Donald Trump" })
findActors({ fullName: "Trump" })
findActors({ fullName: "D. Trump" })

Step 2: If NOT found in any search, create:
{
  "username": "donald_trump",
  "fullName": "Donald Trump",
  "color": "FF5733",
  "nationalities": ["nation-uuid-usa"],
  "bornOn": "1946-06-14",
  "diedOn": null,
  "excerpt": "American businessman and politician"
}
```

**Key Points:**
- Always search first with multiple variations
- Color: System can generate random if you omit (but currently required)
- Nationalities: Use findNations to get UUIDs
- Avatar: Must be existing media UUID or null

---

## Workflow 5: Creating a Group (Organization)

**Goal**: Add an organization to the database

### Pattern: Multiple Search Variations → Create

```
Step 1: Search with multiple name variations
findGroups({ name: "World Health Organization" })
findGroups({ name: "WHO" })
findGroups({ name: "Health Organization" })

Step 2: If NOT found, search for members
findActors({ fullName: "Director Name" })

Step 3: Create group
{
  "username": "world_health_org",
  "name": "World Health Organization",
  "color": "0084FF",
  "kind": "International NGO",
  "startDate": "1948-04-07",
  "members": ["director-uuid-1"]
}
```

---

## Workflow 6: Creating a Quote Event

**Goal**: Record a statement made by someone

### Pattern: Find Actor → Create

```
Step 1: Search for the quote author
findActors({ fullName: "Speaker Name" })

Step 2: Create quote
{
  "date": "2024-02-15",
  "quote": "We must take action on climate change.",
  "actor": "speaker-uuid",
  "subject": null,
  "details": "Said during press conference"
}
```

---

## Workflow 7: Creating a Transaction Event

**Goal**: Record a financial transaction between entities

### Pattern: Find Both Parties → Create

```
Step 1: Find who paid
findActors({ fullName: "Company A" })  OR  findGroups({ name: "Company A" })

Step 2: Find who received
findActors({ fullName: "Company B" })  OR  findGroups({ name: "Company B" })

Step 3: Create transaction
{
  "date": "2024-02-20",
  "title": "Payment from Company A to Company B",
  "total": 1500000,
  "currency": "USD",
  "from": {"type": "Group", "id": "company-a-uuid"},
  "to": {"type": "Group", "id": "company-b-uuid"}
}
```

---

## Workflow 8: Editing an Existing Event

**Goal**: Update parts of an existing event

```
Step 1: Get the event
getEvent({ id: "event-uuid" })

Step 2: Search if adding new actors/groups
findActors({ fullName: "New Actor" })

Step 3: Edit event with new information
{
  "id": "event-uuid",
  "type": "uncategorized",
  "date": "2024-02-15",
  "title": "Updated Title",
  "actors": ["existing-uuid-1", "new-actor-uuid"],
  "draft": false
}
```

---

## 📊 Recursion Limit Strategy

**Limit: 25 tool calls per request**

### For Complex Events (5-10 searches needed):
```
1. Search for 5 actors (in series since each might need multiple variations)
2. Search for 2-3 groups
3. Upload 1-2 images
→ Total: ~10-12 calls
→ Create: 1 call
→ Remaining: 12-14 calls for next task
```

### Optimization Tips:
- **Parallel searches**: Run independent actor searches together
- **Reuse results**: Don't re-search the same person twice
- **Accept empty**: Use empty arrays if not found to save calls
- **Batch operations**: Create multiple events in sequence rather than searching extensively for each one

---

## ✅ Pre-Creation Checklist

Before creating ANY entity:

- [ ] Searched with multiple name/term variations
- [ ] No duplicates found in search results
- [ ] Have all required IDs from search results
- [ ] Verified nested objects have correct `type` and `id` fields
- [ ] Optional fields are null or empty arrays (not omitted)
- [ ] Date fields are in ISO format YYYY-MM-DD
- [ ] Hex colors are without # symbol

---

## 🔧 Troubleshooting

### "I got 0 results for my search"
→ Try alternative names, partial matches, acronyms

### "I found similar but not exact match"
→ Create the entity - the system will handle deduplication later
→ Include enough context in excerpt/body to differentiate

### "Nested object structure causing errors"
→ Check format: `{"type": "Actor", "id": "uuid-string"}`
→ Type must be exactly "Actor" or "Group" (case-sensitive)
→ ID must be a valid UUID string

### "I'm running up against the 25 recursion limit"
→ Accept empty arrays for actors/groups not found
→ Create entity with minimal searches
→ Focus on critical relationships only

---

## 📝 Summary: The 80/20 Pattern

For 80% of use cases, follow this simple pattern:

```
1. findActors for main people
2. findGroups for organizations
3. Create event with found IDs (or empty arrays)

Done!
```

Most events can be created with just these 3 tool calls, leaving plenty of headroom under the 25-call limit.
