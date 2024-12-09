export const EMBED_EVENT_PROMPT = `
You are an expert in summarizing texts. These texts can be either excerpt of web pages or articles.
Your goal is to create a summary of the given text, focusing on the actions made by the characters mentioned in the text.
Try to extract the date of the event, the groups and actors involved.

Below you find the text you need to summarize.

--------
{text}
--------
`;
