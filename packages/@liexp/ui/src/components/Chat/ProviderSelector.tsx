import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  Typography,
} from "../mui/index.js";
import { Alert } from "@mui/material";
import { styled } from "../../theme/index.js";

export type AIProvider = "openai" | "anthropic" | "xai";

export interface ProviderInfo {
  name: string;
  description: string;
  available: boolean;
  models: string[];
  defaultModel: string;
  baseURL: string;
  requiresApiKey: boolean;
}

interface ProviderDetails {
  provider: AIProvider;
  info: ProviderInfo;
}

interface ProviderSelectorProps {
  /** Selected provider */
  selectedProvider: AIProvider | null;
  /** Selected model */
  selectedModel: string | null;
  /** Callback when provider changes */
  onProviderChange: (provider: AIProvider) => void;
  /** Callback when model changes */
  onModelChange: (model: string) => void;
  /** Base URL for fetching provider information */
  providersUrl?: string;
  /** Whether to show description */
  showDescription?: boolean;
  /** Compact mode (minimal styling) */
  compact?: boolean;
}

const ProviderContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(1.5),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

const ProviderDescription = styled(Typography)(({ theme }) => ({
  fontSize: "0.75rem",
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  fontStyle: "italic",
}));

/**
 * ProviderSelector Component
 *
 * Provides a UI for selecting AI providers and models.
 * Fetches available providers from the admin proxy API.
 */
export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  providersUrl = "/api/proxy/agent/providers",
  showDescription = true,
  compact = false,
}) => {
  const [providers, setProviders] = useState<ProviderDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch available providers on mount
  useEffect(() => {
    const fetchProviders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(providersUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch providers: ${response.status}`);
        }
        const data = await response.json();
        setProviders(data.providers || []);

        // Auto-select first available provider if none selected
        if (!selectedProvider && data.providers && data.providers.length > 0) {
          const firstProvider = data.providers[0].provider as AIProvider;
          onProviderChange(firstProvider);
          onModelChange(data.providers[0].info.defaultModel);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load providers",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProviders();
  }, [providersUrl, selectedProvider, onProviderChange, onModelChange]);

  const currentProvider = providers.find(
    (p) => p.provider === selectedProvider,
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
      >
        <CircularProgress size={20} />
        <Typography variant="caption">Loading providers...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="warning" sx={{ fontSize: "0.75rem" }}>
        {error}
      </Alert>
    );
  }

  if (providers.length === 0) {
    return (
      <Alert severity="info" sx={{ fontSize: "0.75rem" }}>
        No providers available. Check your API keys.
      </Alert>
    );
  }

  const selectContent = (
    <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
      <FormControl
        size="small"
        sx={{ minWidth: 140 }}
      >
        <InputLabel id="provider-select-label" sx={{ fontSize: "0.875rem" }}>
          Provider
        </InputLabel>
        <Select
          labelId="provider-select-label"
          id="provider-select"
          value={selectedProvider || ""}
          label="Provider"
          onChange={(e) => {
            const provider = e.target.value as AIProvider;
            onProviderChange(provider);
            // Auto-select default model for new provider
            const providerInfo = providers.find(
              (p) => p.provider === provider,
            );
            if (providerInfo) {
              onModelChange(providerInfo.info.defaultModel);
            }
          }}
          sx={{ fontSize: "0.875rem" }}
        >
          {providers.map((p) => (
            <MenuItem
              key={p.provider}
              value={p.provider}
              disabled={!p.info.available}
            >
              {p.info.name}
              {!p.info.available && " (unavailable)"}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {currentProvider && currentProvider.info.models.length > 0 && (
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel id="model-select-label" sx={{ fontSize: "0.875rem" }}>
            Model
          </InputLabel>
          <Select
            labelId="model-select-label"
            id="model-select"
            value={selectedModel || currentProvider.info.defaultModel}
            label="Model"
            onChange={(e) => onModelChange(e.target.value)}
            sx={{ fontSize: "0.875rem" }}
          >
            {currentProvider.info.models.map((model) => (
              <MenuItem key={model} value={model}>
                {model}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
    </Box>
  );

  if (compact) {
    return <Box>{selectContent}</Box>;
  }

  return (
    <ProviderContainer>
      <Typography variant="caption" sx={{ display: "block", mb: 1 }}>
        AI Provider
      </Typography>
      {selectContent}
      {showDescription && currentProvider && (
        <ProviderDescription>{currentProvider.info.description}</ProviderDescription>
      )}
    </ProviderContainer>
  );
};
