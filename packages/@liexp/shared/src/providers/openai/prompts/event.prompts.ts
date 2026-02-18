import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { type EventType } from "@liexp/io/lib/http/Events/EventType.js";
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
}> = ({ vars }) => `
You are an expert in extracting structured JSON from text. The info extracted from the texts serves to define an 'event' JSON object.
The texts provided used as sources can be either excerpt of web pages, articles or scientific papers.

Your job is to extract the needed info from the text and return a JSON object with AT LEAST these fields:

{{
  title: "The title of the event",
  excerpt: "A short description of the event (100 words max)",
  date: "Array of 1 or 2 ISO date strings (YYYY-MM-DD). Index 0 = start date (required), index 1 = end date (optional).",
  actors: "Array of actor UUIDs or names found in the text. Use [] if none.",
  groups: "Array of group/organization UUIDs or names found in the text. Use [] if none.",
  keywords: "Array of relevant keyword strings. Use [] if none.",
}}

${vars.jsonSchema ? `The output must conform to this schema:\n${vars.jsonSchema}` : ""}

IMPORTANT:
- You MUST always extract or infer at least one date for the event
- Dates MUST be in ISO format (YYYY-MM-DD)
- Do NOT include URLs, links, or references in your response - these are managed separately
- Focus on extracting factual information from the provided text
- For scientific studies: extract the title, publication date, and key findings
- For books: extract the title, publication date, and summary
`;

/**
 * Prompt for creating an event from a URL or document context.
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
 * Prompt for creating an event from multiple links.
 *
 * This prompt synthesizes information from multiple sources to create a single event.
 */
export const CREATE_EVENT_FROM_LINKS_PROMPT: PromptFn<{
  context: string;
  type: EventType;
  jsonSchema: string;
}> = ({ vars }) => `
You are an expert in extracting and synthesizing structured JSON from multiple text sources. Your task is to create a SINGLE comprehensive event from multiple link sources.

CRITICAL INSTRUCTIONS (READ CAREFULLY):
- You MUST return ONLY a single valid JSON object and NOTHING else (no explanation, no markdown, no trailing text).
- The JSON must validate against the following JSON schema. Do not change the schema or add top-level wrappers:

${vars.jsonSchema}

- Always include a _links_ property in the returned object: an array of link identifiers (strings). Do NOT include URLs or raw links — links will be fetched and inserted by the system later. If there are no links, return an empty array ([]).
- You MUST always extract or infer at least one date for the event.
- Dates MUST be in ISO format (YYYY-MM-DDTHH:mm:ss). If time is unavailable, use "00:00:00" for the time portion.

TASK DESCRIPTION:
- The texts provided are from different web pages, articles, or documents that relate to the same event or topic.
- Your job is to synthesize all the information from these multiple sources into a SINGLE 'event' JSON compatible with the createEvent MCP tools from api.lies.exposed.

GUIDELINES:
- SYNTHESIZE information from ALL sources - do not just use one source.
- Cross-reference facts between sources for accuracy.
- If sources conflict, prefer the most detailed or recent information, and do not invent facts.
- Do NOT include URLs, links, or references in your JSON values — these are managed separately.
- For scientific studies: combine findings from multiple papers into a coherent summary including key findings and publication details.
- For news articles: synthesize different perspectives into a balanced account.

The sources you need to extract and synthesize the event from are:

---------------------------------------------------------------
${vars.context}
---------------------------------------------------------------
`;

/**
 * Prompt for updating an existing event by ID.
 *
 *
 */
export const UPDATE_EVENT_PROMPT: PromptFn<{
  id: UUID;
  type: EventType;
}> = ({ vars }) => `
You are an expert in extracting and updating structured JSON from text. Your task is to UPDATE an existing event with new information.

Your job is to analyze this context and update the event JSON object with accurate, relevant information:

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
