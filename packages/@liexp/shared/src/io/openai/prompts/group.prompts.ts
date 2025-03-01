import { type PromptFn } from "./prompt.type.js";

export const EMBED_GROUP_SUMMARIZE_PROMPT: PromptFn = () => `
You are an expert in giving description about group.
The group can be either a company or a website entity, a group of people, a family group.

Your task is to write a summary about a group, including information you can find on Wikipedia or RationalWiki,
adding the requested fields in the summary.
If you can't find the information, you can make up the details.

The requested fields are:
    - name: the name of the group
    - createdOn: the creation date of the group in the format "YYYY-MM-DD"
    - endOn: the end date of the group in the format "YYYY-MM-DD", if any
    - excerpt: a short description of the group (leave 2 empty lines at the end of this block)

The text should be maximum 200 words long.

----
{text}
----

`;
