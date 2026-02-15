/**
 * AI Provider Registry for Admin Proxy
 *
 * Manages AI provider configurations, validation, and metadata
 * Provides information about available providers and their capabilities
 */

import { type AIProvider, type AvailableModels } from "@liexp/io/lib/http/Chat.js";
import { ServerError } from "@liexp/backend/lib/errors/ServerError.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { type Logger } from "@liexp/core/lib/logger/index.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import { type AdminProxyENV } from "../io/ENV.js";

/**
 * Provider configuration as specified in client requests
 */
export interface ProviderConfig {
  provider: AIProvider;
  model?: AvailableModels;
}

/**
 * Detailed information about a provider
 */
export interface ProviderInfo {
  name: string;
  description: string;
  available: boolean;
  models: AvailableModels[];
  defaultModel: AvailableModels;
  baseURL: string;
  requiresApiKey: boolean;
}

/**
 * AI Provider Registry
 */
export interface AIProviderRegistry {
  // Validate provider config
  validate: (
    config: ProviderConfig,
  ) => TE.TaskEither<ServerError, ProviderConfig>;

  // Get available providers
  listAvailable: () => AIProvider[];

  // Get provider details
  getInfo: (provider: AIProvider) => TE.TaskEither<ServerError, ProviderInfo>;

  // Check if provider is available
  isAvailable: (provider: AIProvider) => boolean;

  // Get default model for provider
  getDefaultModel: (provider: AIProvider) => TE.TaskEither<ServerError, AvailableModels>;

  // Validate model is supported by provider
  validateModel: (
    provider: AIProvider,
    model: AvailableModels,
  ) => TE.TaskEither<ServerError, boolean>;
}

/**
 * Create AI Provider Registry from environment
 */
export const GetAIProviderRegistry = (
  env: AdminProxyENV,
  logger: Logger,
): AIProviderRegistry => {
  // Define available providers with their metadata
  const providers = new Map<AIProvider, ProviderInfo>([
    [
      "openai",
      {
        name: "OpenAI",
        description: "OpenAI GPT-4 and GPT-4o models",
        available: !!env.OPENAI_API_KEY,
        models: ["gpt-4", "gpt-4o"] as AvailableModels[],
        defaultModel: "gpt-4o",
        baseURL: env.OPENAI_BASE_URL || "https://api.openai.com/v1",
        requiresApiKey: true,
      },
    ],
    [
      "anthropic",
      {
        name: "Anthropic Claude",
        description: "Anthropic Claude 3 family of models",
        available: !!env.ANTHROPIC_API_KEY,
        models: [
          "claude-sonnet-4-20250514",
          "claude-3-7-sonnet-latest",
          "claude-3-5-haiku-latest",
        ] as AvailableModels[],
        defaultModel: "claude-sonnet-4-20250514",
        baseURL: "https://api.anthropic.com",
        requiresApiKey: true,
      },
    ],
    [
      "xai",
      {
        name: "XAI Grok",
        description: "X.AI Grok models",
        available: !!env.XAI_API_KEY,
        models: ["grok-4-fast"] as AvailableModels[],
        defaultModel: "grok-4-fast",
        baseURL: "https://api.x.ai/v1",
        requiresApiKey: true,
      },
    ],
  ]);

  /**
   * Validate provider config
   */
  const validate = (config: ProviderConfig) =>
    pipe(
      TE.Do,
      TE.chain(() => {
        if (!providers.has(config.provider)) {
          logger.warn.log(`Invalid provider requested: ${config.provider}`);
          return TE.left(
            new ServerError(
              `Provider not supported: ${config.provider}. Available: openai, anthropic, xai`,
              {
                kind: "ServerError",
                status: "400",
              },
            ),
          );
        }

        const info = providers.get(config.provider)!;
        if (!info.available) {
          logger.warn.log(
            `Provider ${config.provider} not available (missing API key)`,
          );
          return TE.left(
            new ServerError(
              `Provider ${config.provider} is not available. Missing API key.`,
              {
                kind: "ServerError",
                status: "400",
              },
            ),
          );
        }

        // Validate model if specified
        if (config.model && !info.models.includes(config.model)) {
          logger.warn.log(
            `Invalid model ${config.model} for provider ${config.provider}`,
          );
          return TE.left(
            new ServerError(
              `Model ${config.model} not supported by ${config.provider}. Available: ${info.models.join(", ")}`,
              {
                kind: "ServerError",
                status: "400",
              },
            ),
          );
        }

        return TE.right(config);
      }),
    );

  /**
   * Get list of available providers
   */
  const listAvailable = () => {
    return Array.from(providers.entries())
      .filter(([, info]) => info.available)
      .map(([provider]) => provider);
  };

  /**
   * Get provider info
   */
  const getInfo = (provider: AIProvider) =>
    pipe(
      TE.Do,
      TE.chain(() => {
        const info = providers.get(provider);
        if (!info) {
          return TE.left(
            new ServerError(`Unknown provider: ${provider}`, {
              kind: "ServerError",
              status: "404",
            }),
          );
        }
        return TE.right(info);
      }),
    );

  /**
   * Check if provider is available
   */
  const isAvailable = (provider: AIProvider): boolean => {
    const info = providers.get(provider);
    return info ? info.available : false;
  };

  /**
   * Get default model for provider
   */
  const getDefaultModel = (provider: AIProvider) =>
    pipe(
      getInfo(provider),
      TE.map((info) => info.defaultModel),
    );

  /**
   * Validate model is supported by provider
   */
  const validateModel = (provider: AIProvider, model: AvailableModels) =>
    pipe(
      getInfo(provider),
      TE.map((info) => info.models.includes(model)),
    );

  logger.info.log(
    `AI Provider Registry initialized with ${providers.size} providers`,
  );
  const availableCount = listAvailable().length;
  logger.info.log(
    `${availableCount} providers available: ${listAvailable().join(", ")}`,
  );

  return {
    validate,
    listAvailable,
    getInfo,
    isAvailable,
    getDefaultModel,
    validateModel,
  };
};
