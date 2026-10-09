import { pipe } from "@liexp/core/lib/fp/index.js";
import type { AxiosResponse } from "axios";
import axios from "axios";
import * as TE from "fp-ts/lib/TaskEither.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SearchResult {
  id: string;
  memory: string;
  score: number;
  metadata: Record<string, unknown>;
  categories?: string[];
  created_at: string;
  updated_at: string;
}

interface SearchResponse {
  results: SearchResult[];
}

interface AddResponse {
  event_id: string;
  status: string;
}

// ---------------------------------------------------------------------------
// Memory client
// ---------------------------------------------------------------------------

/**
 * Lightweight client wrapping the mem0 v3 REST API.
 * All functions use fp-ts TaskEither for consistency with the codebase.
 * Returns Left when MEM0_API_URL is not configured (graceful degradation).
 */

export interface MemoryClient {
  searchMemories: (
    query: string,
    agentId: string,
    topK?: number,
  ) => TE.TaskEither<Error, SearchResult[]>;
  addMemory: (
    content: string,
    agentId: string,
  ) => TE.TaskEither<Error, string>;
}

const MAX_RESULTS = 5;
const SEARCH_TIMEOUT_MS = 5000;

export const createMemoryClient = (
  baseUrl: string,
): MemoryClient => {
  const http = axios.create({
    baseURL: baseUrl.replace(/\/+$/, ""),
    timeout: SEARCH_TIMEOUT_MS,
    headers: { "Content-Type": "application/json" },
  });

  return {
    searchMemories: (
      query: string,
      agentId: string,
      topK = MAX_RESULTS,
    ): TE.TaskEither<Error, SearchResult[]> =>
      pipe(
        TE.tryCatch(
          () =>
            http.post<SearchResponse>("/v3/memories/search/", {
              query,
              filters: { agent_id: agentId },
              top_k: Math.min(topK, MAX_RESULTS),
            }),
          (error) =>
            error instanceof Error
              ? error
              : new Error(String(error)),
        ),
        TE.map(
          (response: AxiosResponse<SearchResponse>) =>
            response.data.results.slice(0, MAX_RESULTS),
        ),
      ),

    addMemory: (
      content: string,
      agentId: string,
    ): TE.TaskEither<Error, string> =>
      pipe(
        TE.tryCatch(
          () =>
            http.post<AddResponse>("/v3/memories/add/", {
              messages: [{ role: "user", content }],
              agent_id: agentId,
            }),
          (error) =>
            error instanceof Error
              ? error
              : new Error(String(error)),
        ),
        TE.map(
          (response: AxiosResponse<AddResponse>) => response.data.event_id,
        ),
      ),
  };
};

// ---------------------------------------------------------------------------
// Flow-level helpers
// ---------------------------------------------------------------------------

/**
 * Format search results for injection into the agent prompt.
 * Limits to top 3 results to control prompt size.
 */
export const formatMemoriesForPrompt = (
  results: SearchResult[],
): string => {
  const limit = Math.min(results.length, 3);
  if (limit === 0) return "";

  const memories = results
    .slice(0, limit)
    .map((r, i) => `${i + 1}. ${r.memory}`)
    .join("\n");

  return [
    "",
    "[Relevant memories from past conversations:]",
    memories,
    "",
  ].join("\n");
};
