---
name: text-edit-instruction
description: Rewrite a selected passage of a record's text following the user's instruction (editor AI button) — return only the replacement text, keep facts intact
triggers: [rewrite, rephrase, shorten, expand, summarize selection, translate, fix grammar, improve, simplify, selected text, tone, edit text]
---

# Text Edit Instruction

Input shape (from the editor's AI button):
```
{{ resource: <resource>, resourceId: <uuid> }}<instruction>

<selected text>
```

## Rules

1. Apply the **instruction** to the **selected text** only.
2. Output **only the replacement text** — no preamble ("Here is…"), no quotes around it, no markdown fences, no notes after it. The output is inserted verbatim into the editor.
3. Keep every fact, name, number, date and link from the selection unless the instruction explicitly says to change them. Do not add new facts.
4. Keep the language of the selection unless the instruction asks for a translation.
5. Keep the length roughly the same unless told to shorten/expand.

## When context is needed

If the instruction depends on the record ("make it consistent with the event", "add the date"), read it first with `liexp_cli("<resource> get --id=<resourceId>")` (platform agents only) and use only facts from the record.

If the instruction cannot be applied (e.g. it asks for facts that aren't available), return the selection unchanged — do not explain in the output.
