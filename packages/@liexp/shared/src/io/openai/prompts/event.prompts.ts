export const EMBED_EVENT_PROMPT = `
  Given the following text, extract a json with the following keys:
  - excerpt: a summary of the text in maximum 300 characters
  - date: the date of the event
  - actors: a list of actors mentioned in the text
  - keywords: a list of keywords mentioned in the text in lower case
`;
