import { type PromptFn } from "./prompt.type.js";

export const EMBED_ACTOR_PROMPT: PromptFn<{ text: string }> = ({
  vars: { text },
}) => `
You are an expert in giving description about people.
Your goal is to give a description of a given person in a text format, including the requested fields, without inventing details.
The text should be minimum 100 words long, but not exceeding 300 words long.

The requested fields are:
    - name: the name of the person
    - birthOn: the birth date of the person (in the format "YYYY-MM-DD")
    - diedOn: the death date of the person (in the format "YYYY-MM-DD")
    - excerpt: a short description of the person (leave 2 empty lines at the end of this block)
    - body: a longer description of the person

Here's the name of the person you need to describe:

---------------------------------------------------------------
${text}
---------------------------------------------------------------
`;

export const ACTOR_GENERAL_INFO_PROMPT: PromptFn<{
  text: string;
  question: string;
}> = ({ vars }) => {
  const { text, question } = vars;
  return `
You are an expert in giving description about people.
Your goal is to create a description including the requested fields about a given person, without inventing details.

The requested fields are:
    - name: the name of the person
    - birthOn: the birth date of the person in the format "YYYY-MM-DD"
    - diedOn: the death date of the person in the format "YYYY-MM-DD"
    - excerpt: a short description of the person (leave 2 empty lines at the end of this block)
    - body: a longer description of the person

Below you find the person name and, optionally, a previous description of the person.

---------------------------------------------------------------
${text}
---------------------------------------------------------------

Question: ${question}

Give me your answer.
`;
};
