import { type PromptFn } from "./prompt.type.js";

export const EMBED_LINK_PROMPT: PromptFn<{
  text: string;
}> = ({ vars: { text } }) => `
You are an expert in extracting structured metadata from web content.
You are provided a URL that you must open and analyze.
If a web browsing tool is available, use it to fetch and read the page content before answering.

The URL may point to any of the following content types:
- Newspaper or magazine article
- Scientific study or research paper
- Patent description
- Blog post or opinion piece
- Official press release or institutional document
- General web resource

Your task is to extract accurate metadata from the page and return a JSON object with ALL of the following fields:

- title: string — the exact title of the page or article (do NOT paraphrase; use the original title)
- description: string — a factual, neutral summary of the content (150–300 words, plain text, no HTML or URLs).
  Focus on: what happened or was reported, who is involved (named persons, organizations, institutions),
  what claims or findings are made, and what the significance is.
  Do NOT start with "The article is about" or similar filler phrases.
- publishDate: string — the publication or last-updated date in 'YYYY-MM-DD' format.
  Use an empty string "" if no date can be found on the page.
  If only a year or month/year is available, use the first day (e.g. "2023-01-01" or "2023-06-01").
- thumbnailUrl: string | null — the URL of the main representative image for the page (e.g. Open Graph og:image,
  Twitter card image, or the most prominent article image). Use null if no suitable image is found.
  Must be an absolute URL (starting with http:// or https://). Do NOT use icons, logos, or decorative images.

IMPORTANT RULES:
- Do NOT invent, infer, or hallucinate any details not present on the page.
- Do NOT include URLs or hyperlinks inside description or title values.
- If the page is behind a paywall or cannot be accessed, return title and description as empty strings, publishDate as "", and thumbnailUrl as null.
- For scientific papers: use the paper's own abstract as the basis for the description; include publication date if stated.
- For patents: use the patent's abstract and filing/publication date.

Here is the URL to open and extract information from: ${text}
`;
