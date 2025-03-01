import { type PromptFn } from "./prompt.type.js";

export const EMBED_LINK_PROMPT: PromptFn = () => `
You are an expert in summarizing texts. These texts can be either excerpt of web pages or articles.
Your goal is to create a summary of the given text, focusing on the actions made by the characters mentioned in the text.
Below you find the text you need to summarize.

--------
{text}
--------
`;
