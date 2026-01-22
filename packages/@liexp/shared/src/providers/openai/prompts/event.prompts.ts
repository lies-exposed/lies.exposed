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
 * Prompt for creating an event from multiple links.
 *
 * This prompt synthesizes information from multiple sources to create a single event.
 */
export const CREATE_EVENT_FROM_LINKS_PROMPT: PromptFn<{
  context: string;
  type: EventType;
}> = ({ vars }) => `
You are an expert in extracting and synthesizing structured JSON from multiple text sources. Your task is to create a SINGLE comprehensive event from multiple link sources.

The texts provided are from different web pages, articles, or documents that relate to the same event or topic.

Your job is to synthesize all the information from these multiple sources into a SINGLE 'event' of api.lies.exposed:

IMPORTANT GUIDELINES:
- SYNTHESIZE information from ALL sources - do not just use one source
- Cross-reference facts between sources for accuracy
- If sources conflict, prefer the most detailed or recent information
- You MUST always extract or infer at least one date for the event
- Dates MUST be in ISO format (YYYY-MM-DDTHH:mm:ss - if you can't get the time simply use "00:00:00")
- Do NOT include URLs, links, or references in your response - but ensure to assign the given links to the event you create
- Focus on extracting factual information and identifying common themes across sources
- For scientific studies: combine findings from multiple papers into a coherent summary
- For news articles: synthesize different perspectives into a balanced account

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
