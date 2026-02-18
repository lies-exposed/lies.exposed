import { type PromptFn } from "./prompt.type.js";

export const EMBED_ACTOR_PROMPT: PromptFn<{
  text: string;
}> = ({ vars: { text } }) => `
You are an expert in giving descriptions of people.
Your goal is to provide details about a given person using only factual information.

If tools are available, use them to:
1. Retrieve the list of events related to this actor
2. Use those events as context to enrich your summary
3. Search for additional information on Wikipedia or other sources if needed

Do NOT invent or make up any details. Only use factual information from the events and verified sources.

Return a JSON object with these fields:
- firstName: string — the actor's first name
- lastName: string — the actor's last name
- username: string — lowercase slug in the format "firstname-lastname"
- description: string — factual biography (200 words max, plain text, no HTML or URLs)
- bornOn: string — birth date in ISO format (YYYY-MM-DD), or empty string if unknown
- diedOn: string — death date in ISO format (YYYY-MM-DD), or empty string if still alive
- keywords: string[] — relevant topic keywords (empty array if none)

The actor you need to describe is: ${text}
`;
