import type { ChatMessage, AIConfig } from "@liexp/io/lib/http/Chat.js";

// Simple token estimation: roughly 1 token ≈ 4 characters
export const estimateTokens = (text: string): number => {
  const words = text.trim().split(/\s+/).length;
  const chars = text.length;
  return Math.ceil((words * 1.3 + chars / 4) / 2);
};

export interface StreamingChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  conversationId: string | null;
  /** Accumulated content from content_delta events */
  streamingContent: string;
  /** Accumulated thinking content from thinking events */
  thinkingContent: string;
  activeToolCalls: Map<string, { name: string; args?: string }>;
  completedToolCalls: { name: string; result: string }[];
  tokenUsage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    /** True during streaming, false when finalized */
    isEstimated: boolean;
  } | null;
  aiConfig: AIConfig | null;
  usedProvider: { provider: string; model: string } | null;
}

export const INITIAL_STATE: StreamingChatState = {
  messages: [],
  isLoading: false,
  error: null,
  conversationId: null,
  streamingContent: "",
  thinkingContent: "",
  activeToolCalls: new Map(),
  completedToolCalls: [],
  tokenUsage: null,
  aiConfig: null,
  usedProvider: null,
};
