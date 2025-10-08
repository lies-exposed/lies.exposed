import { type EventType } from "../../http/Events/EventType.js";
import { type PromptFn } from "./prompt.type.js";

export const EMBED_EVENT_PROMPT: PromptFn<{ text: string }> = ({ vars }) => `
You are an expert in summarizing texts. These texts can be either excerpt of web pages or articles.
Your goal is to create a summary of the given text, focusing on the actions made by the characters mentioned in the text.
Try to extract the date of the event, the groups and actors involved.
Respond with a professional summary of the event, without starting with "the text is about" or similar expression.

---------------------------------------------------------------
${vars.text}
---------------------------------------------------------------
`;

const CREATE_EVENT_PROMPT: PromptFn<{
  jsonSchema: string;
  type: EventType;
}> = () => `
You are an expert in extracting structured JSON from text. The info extracted from the texts serves to define an 'event' JSON object.
The texts provided used as sources can be either excerpt of web pages, articles or scientific papers.

Your job is to extract the needed info from text in the shape of an 'event' JSON object like

{{
  title: "The title of the event",
  excerpt: "A short description of the event (100 words max)",
  date: "An array composed of 2 JSON valid date strings. The first element indicates the start, while the second is the end of the event and can be optional.",
  url: "An optional link to an article or reference of the event",
}}
`;

/**
 * Prompt for creating an event from text.
 *
 */
export const CREATE_EVENT_FROM_URL_PROMPT: PromptFn<{
  jsonSchema: string;
  context: string;
  type: EventType;
}> = ({ vars }) => `
${CREATE_EVENT_PROMPT({ vars })}

The context you need to extract the event from is:

---------------------------------------------------------------
${vars.context}
---------------------------------------------------------------
`;

/**
 * Prompt for creating an event from a text.
 *
 */
export const CREATE_EVENT_FROM_TEXT_PROMPT: PromptFn<{
  jsonSchema: string;
  context: string;
  type: EventType;
  question: string;
}> = ({ vars }) => `
${CREATE_EVENT_FROM_URL_PROMPT({ vars })}

Try to create a valid event, without inventing any detail from the following question: ${vars.question}
`;
