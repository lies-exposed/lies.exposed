import { type PromptFn } from "./prompt.type.js";

export const EMBED_ACTOR_PROMPT: PromptFn<{
  text: string;
  question: string;
}> = ({ vars: { text, question } }) => `
You are an expert in giving description about people.
Your goal is to give a description of a given person in a text format, including the requested fields, without inventing details.
The text should be minimum 100 words long, but not exceeding 300 words long.

The requested fields are:
  - the name of the person
  - the birth date of the person (in the format "YYYY-MM-DD")
  - if has passed away, the death date of the person (in the format "YYYY-MM-DD")

Here's the text you should use to extract the information from:

---------------------------------------------------------------
${text}
---------------------------------------------------------------

There may be an additional question which answer should be included in the body of the text: ${question}
`;
