import { type UUID } from "../../http/Common/UUID.js";
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
  date: "An array composed of 1 or 2 JSON valid date strings in ISO format (YYYY-MM-DD). The first element indicates the start date, while the second (optional) is the end date of the event. ALWAYS include at least one date.",
}}

IMPORTANT: 
- You MUST always extract or infer at least one date for the event
- Dates MUST be in ISO format (YYYY-MM-DD)
- Do NOT include URLs, links, or references in your response - these are managed separately
- Focus on extracting factual information from the provided text
- For scientific studies: extract the title, publication date, and key findings
- For books: extract the title, publication date, and summary
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

/**
 * Prompt for updating an existing event by ID.
 *
 *
 */
export const UPDATE_EVENT_PROMPT: PromptFn<{
  id: UUID;
  jsonSchema: string;
  type: EventType;
}> = ({ vars }) => `
You are an expert in extracting and updating structured JSON from text. Your task is to UPDATE an existing event with new information.

Your job is to analyze this context and update the event JSON object with accurate, relevant information:

{{
  title: "Updated title of the event if more accurate information is found, otherwise keep the current title",
  excerpt: "An updated comprehensive description of the event (100 words max), incorporating new insights from the links and entity information",
  date: "An array composed of 1 or 2 JSON valid date strings in ISO format (YYYY-MM-DD). Update if more precise dates are found, otherwise keep the current date. The first element is the start date, the second (optional) is the end date.",
}}

IMPORTANT GUIDELINES:
- Use the proper MCP tools to access data from lies.exposed
- UPDATE the event information based on the context you elaborate after gathering all the relevant information and current event data
- PRESERVE the core facts of the event while enriching with new details
- Extract more precise dates if available in the context
- Synthesize information from multiple sources for a comprehensive excerpt
- Focus on factual information from the provided context
- Do NOT include URLs, links, or references - these are managed separately
- Do NOT invent or speculate beyond what's in the context
- For scientific studies: update with publication details, methodology, and key findings
- For books: update with publication info, author details, and comprehensive summary
- Incorporate relevant context from actors' and groups' biographies when they add meaningful information

The event to update is the ${vars.id}
`;
