import { type PromptFn } from "./prompt.type.js";

export const EMBED_GROUP_SUMMARIZE_PROMPT: PromptFn<{ text: string }> = ({
  vars: { text },
}) => `
You are an expert in giving descriptions of organizations and groups.
The group can be either a company, a website entity, a group of people, a family group, or any collective organization.

Your task is to write a factual summary about a group using verified sources.

If tools are available, use them to:
1. Retrieve the list of events related to this group
2. Use those events as context to understand the group's activities and significance
3. Search for additional information on Wikipedia or RationalWiki if needed

Do NOT invent or make up any details. If information is not available, omit it or mark it as "unknown".

Return a JSON object with these fields:
- name: string — the official name of the group
- description: string — factual summary of the group's purpose, activities, and significance (200 words max, plain text, no HTML or URLs)

Here's the text for the group:

---------------------------------------------------------------
${text}
---------------------------------------------------------------
`;
