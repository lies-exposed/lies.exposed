import { type PromptFn } from "./prompt.type.js";

export const EMBED_GROUP_SUMMARIZE_PROMPT: PromptFn<{ text: string }> = ({
  vars: { text },
}) => `
You are an expert in giving description about organizations and groups.
The group can be either a company, a website entity, a group of people, a family group, or any collective organization.

Your task is to write a factual summary about a group using:

IMPORTANT: Use the tools available to:
1. Retrieve the list of events related to this group
2. Use those events as context to understand the group's activities and significance
3. Search for additional information on Wikipedia or RationalWiki if needed

Do NOT invent or make up any details. If information is not available, leave the field empty or mark it as "unknown".

The requested fields are:
    - name: the name of the group
    - createdOn: the creation date of the group in the format "YYYY-MM-DD" (or "unknown" if not available)
    - endOn: the end date of the group in the format "YYYY-MM-DD", if any (or null if still active)
    - excerpt: a short description of the group based on verified sources and related events (leave 2 empty lines at the end of this block)

The text should be maximum 200 words long and based only on factual information.

Here's the text for the group:

---------------------------------------------------------------
${text}
---------------------------------------------------------------
`;
