import { EventType } from "../../http/Events/EventType.js";

export const EMBED_EVENT_PROMPT = `
You are an expert in summarizing texts. These texts can be either excerpt of web pages or articles.
Your goal is to create a summary of the given text, focusing on the actions made by the characters mentioned in the text.
Try to extract the date of the event, the groups and actors involved.

Below you find the text you need to summarize.

--------
{text}
--------
`;

/**
 * Prompt for creating an event from text.
 *
 * @param format_instructions Instructions on how to format the event.
 * @param text The text to extract the event from.
 */
export const CREATE_EVENT_FROM_TEXT_PROMPT = `
  You are an expert in extracting events from text as valid JSON with the given format instructions.
  This events can be one of the following type: ${EventType.types.map((t) => t.value).join(", ")}.

  {format_instructions}

  And here's maybe an additional question about the event: {question}

  The context you need to extract the event from is:

  --------
  {text}
  --------
`;

/**
 * Prompt for creating an event from a question.
 *
 * @param eventType The type of event to create.
 * @param question The question to create the event from.
 */
export const CREATE_EVENT_FROM_QUESTION = `
You are an expert in returning events as valid json object.
The event can be one of the following type: ${EventType.types.map((t) => t.value).join(", ")}.

Respond with a valid JSON object, conforming to the following JSON OPENAPI schema:

---
{jsonSchema}
---

Try to create a valid event, without inventing any detail from the following question: {question}
`;
