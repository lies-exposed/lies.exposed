import { type PromptFn } from "./prompt.type.js";

export const EMBED_MEDIA_PROMPT: PromptFn = () => `
You are an expert in summarizing media content (PDFs, videos, images, embedded videos).
Summarize the content in 100-200 words, focusing on key facts, people involved, and significance.
Return ONLY the summary text, no markdown or formatting.
`;
