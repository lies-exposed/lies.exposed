import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import { effectToZod } from "@liexp/shared/lib/utils/schema.utils.js";
import { Schema } from "effect";
import { tool } from "langchain";
import { type BraveProviderContext } from "../../../context/brave.context.js";
import { type LoggerContext } from "../../../context/logger.context.js";

const SearchWebInputSchema = Schema.Struct({
  query: Schema.String.annotations({
    description:
      "The search query to use. This will be used in a Google site-specific search.",
  }),
  count: Schema.UndefinedOr(Schema.Number).annotations({
    description:
      "Number of search results to retrieve. Each page typically contains 10 results.",
  }),
  offset: Schema.UndefinedOr(Schema.Number).annotations({
    description:
      "The number of search results to skip before starting to collect the result set.",
  }),
  date: Schema.UndefinedOr(Schema.String).annotations({
    description:
      "Optional date filter in ISO format (YYYY-MM-DD). Searches will be limited to content published within 5 days of this date.",
  }),
  keywords: Schema.Array(Schema.String).annotations({
    description:
      "Optional array of keywords to include in the search. These help refine the search results.",
  }),
});

type SearchWebInputSchema = typeof SearchWebInputSchema.Type;

const searchWebInput = effectToZod(SearchWebInputSchema);

/**
 * Creates a web search tool that uses Google site-specific search
 * to find news articles on trusted providers.
 */
export const createSearchWebTool = <
  C extends BraveProviderContext & LoggerContext,
>(
  ctx: C,
) => {
  const searchFunction = async (
    input: SearchWebInputSchema,
  ): Promise<string> => {
    const { query, count, offset, date, keywords } = input;

    ctx.logger.debug.log("Searching in the web with query: %s", query);

    const finalQuery = query + keywords.join(" ");

    const task = pipe(
      ctx.brave.webSearch(finalQuery, {
        freshness: date ? `${formatDate(date)}` : undefined,
        offset,
        count,
      }),
      fp.TE.map((response) => {
        const { web: { results: urls } = { results: [] } } = response;
        if (urls.length === 0) {
          return `No results found for "${query}".`;
        }

        const urlList = urls
          .map(
            (url, i) =>
              `${i + 1}. ${url.url}\n${url.title}\n${url.description}\n:Thumbnail: ${url.thumbnail?.original}`,
          )
          .join("\n");

        return `## Search Results for "${query}"\n\nFound ${urls.length} URLs:\n\n${urlList}\n\n---\n\nUse the \`createLink\` tool to add any of these URLs to the database for further analysis.`;
      }),
      fp.TE.fold(
        (error) => () => Promise.resolve(`Error searching: ${error}`),
        (result) => () => Promise.resolve(result),
      ),
    );

    return task();
  };

  const searchWebTool = tool<any, any, any, any>(searchFunction, {
    name: "searchWeb",
    description: "Search the web for the given query.",
    schema: searchWebInput,
  });

  return searchWebTool;
};
