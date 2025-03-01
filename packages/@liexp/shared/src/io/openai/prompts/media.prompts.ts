import { type PromptFn } from "./prompt.type.js";

export const EMBED_MEDIA_PROMPT: PromptFn = () =>
  "Give me a summary of this media content. The media is either a PDF, a video, an image or an iframe to an external video.";
