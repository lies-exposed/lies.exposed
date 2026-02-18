import { alpha } from "@mui/system";
import React, { useState, useEffect } from "react";
import { styled } from "../../theme/index.js";
import {
  Alert,
  Box,
  CircularProgress,
  Typography,
  Popover,
} from "../mui/index.js";

export type AIProvider = "openai" | "anthropic" | "xai";

export interface ProviderInfo {
  name: string;
  description: string;
  available: boolean;
  models: string[];
  defaultModel: string;
}

// Map provider name to provider type
function getProviderType(name: string): AIProvider {
  if (name === "openai" || name === "anthropic" || name === "xai") {
    return name as AIProvider;
  }
  return "openai"; // fallback
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
  /** Function to get the auth token for authenticated requests */
  getAuthToken?: () => string | null;
  /** Whether to show description */
  showDescription?: boolean;
  /** Compact mode (minimal styling) */
  compact?: boolean;
  /** Last used provider info */
  usedProvider?: { provider: string; model: string } | null;
}

const PROVIDER_ICONS: Record<AIProvider, string> = {
  openai: "O",
  anthropic: "A",
  xai: "X",
};

const ProviderChip = styled("button")<{
  selected?: boolean;
  disabled?: boolean;
}>(({ theme, selected, disabled }) => ({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  padding: "4px 10px",
  border: `1px solid ${selected ? theme.palette.primary.main : theme.palette.divider}`,
  borderRadius: 20,
  backgroundColor: selected
    ? alpha(theme.palette.primary.main, 0.08)
    : "transparent",
  color: disabled
    ? theme.palette.text.disabled
    : selected
      ? theme.palette.primary.main
      : theme.palette.text.secondary,
  fontSize: "0.7rem",
  fontFamily: theme.typography.fontFamily,
  fontWeight: selected ? 600 : 400,
  cursor: disabled ? "not-allowed" : "pointer",
  outline: "none",
  transition: "all 0.15s ease",
  whiteSpace: "nowrap" as const,
  "&:hover": disabled
    ? {}
    : {
        borderColor: theme.palette.primary.main,
        backgroundColor: alpha(theme.palette.primary.main, 0.04),
      },
}));

const ModelChip = styled("button")<{ selected?: boolean }>(
  ({ theme, selected }) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    padding: "3px 8px",
    border: "none",
    borderRadius: 12,
    backgroundColor: selected
      ? alpha(theme.palette.primary.main, 0.1)
      : alpha(theme.palette.action.hover, 0.04),
    color: selected ? theme.palette.primary.main : theme.palette.text.secondary,
    fontSize: "0.65rem",
    fontFamily: theme.typography.fontFamily,
    fontWeight: selected ? 600 : 400,
    cursor: "pointer",
    outline: "none",
    transition: "all 0.15s ease",
    whiteSpace: "nowrap" as const,
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.08),
    },
  }),
);

const ProviderIcon = styled("span")<{ provider: AIProvider }>(({
  theme,
  provider,
}) => {
  const colors: Record<AIProvider, string> = {
    openai: "#10a37f",
    anthropic: "#d4a574",
    xai: "#1da1f2",
  };
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 16,
    height: 16,
    borderRadius: "50%",
    backgroundColor: colors[provider] ?? theme.palette.grey[400],
    color: "#fff",
    fontSize: "0.55rem",
    fontWeight: 700,
    lineHeight: 1,
    flexShrink: 0,
  };
});

/**
 * ProviderSelector Component
 *
 * Modern chip-based UI for selecting AI providers and models.
 * Fetches available providers from the admin proxy API.
 */
export const ProviderSelector: React.FC<ProviderSelectorProps> = ({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
  providersUrl = "/api/proxy/agent/providers",
  getAuthToken,
  usedProvider,
}) => {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelAnchor, setModelAnchor] = useState<HTMLElement | null>(null);

  // Stable refs for callbacks to avoid re-triggering the effect
  const onProviderChangeRef = React.useRef(onProviderChange);
  onProviderChangeRef.current = onProviderChange;
  const onModelChangeRef = React.useRef(onModelChange);
  onModelChangeRef.current = onModelChange;
  const selectedProviderRef = React.useRef(selectedProvider);
  selectedProviderRef.current = selectedProvider;

  // Fetch available providers on mount (runs once)
  useEffect(() => {
    let cancelled = false;

    const fetchProviders = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const headers: HeadersInit = {};
        const authToken = getAuthToken?.();
        if (authToken) {
          headers.Authorization = authToken;
        }
        const response = await fetch(providersUrl, { headers });
        if (cancelled) return;
        if (!response.ok) {
          throw new Error(`Failed to fetch providers: ${response.status}`);
        }
        const rawData = await response.json();
        if (cancelled) return;

        // Handle both response formats:
        // 1. Direct format: { providers: [...] }
        // 2. Wrapped format: { body: { data: { providers: [...] } } }
        // 3. Data wrapper format: { data: { providers: [...] } }
        const data = rawData.body?.data ?? rawData.data ?? rawData;
        setProviders(data.providers ?? []);

        // Auto-select first available provider if none selected
        if (!selectedProviderRef.current && data.providers?.length > 0) {
          const firstProvider = getProviderType(data.providers[0].name);
          onProviderChangeRef.current(firstProvider);
          onModelChangeRef.current(data.providers[0].defaultModel);
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load providers",
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchProviders();

    return () => {
      cancelled = true;
    };
  }, [providersUrl, getAuthToken]);

  const currentProvider = providers.find(
    (p) => getProviderType(p.name) === selectedProvider,
  );

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          py: 0.5,
        }}
      >
        <CircularProgress size={12} />
        <Typography
          variant="caption"
          sx={{ fontSize: "0.65rem", color: "text.secondary" }}
        >
          Loading providers...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="warning"
        sx={{
          fontSize: "0.65rem",
          py: 0,
          "& .MuiAlert-icon": { fontSize: 14 },
        }}
      >
        {error}
      </Alert>
    );
  }

  if (providers.length === 0) {
    return null;
  }

  const activeModel = selectedModel ?? currentProvider?.defaultModel ?? null;

  const handleProviderClick = (provider: AIProvider) => {
    onProviderChange(provider);
    const providerInfo = providers.find(
      (p) => getProviderType(p.name) === provider,
    );
    if (providerInfo) {
      onModelChange(providerInfo.defaultModel);
    }
  };

  const handleModelChipClick = (event: React.MouseEvent<HTMLElement>) => {
    setModelAnchor(event.currentTarget);
  };

  const handleModelSelect = (model: string) => {
    onModelChange(model);
    setModelAnchor(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexWrap: "wrap",
        py: 0.5,
      }}
    >
      {providers.map((p) => (
        <ProviderChip
          key={p.name}
          selected={selectedProvider === getProviderType(p.name)}
          disabled={!p.available}
          onClick={() => {
            if (p.available) handleProviderClick(getProviderType(p.name));
          }}
          title={p.description}
        >
          <ProviderIcon provider={getProviderType(p.name)}>
            {PROVIDER_ICONS[getProviderType(p.name)]}
          </ProviderIcon>
          {p.name}
        </ProviderChip>
      ))}

      {currentProvider && activeModel && (
        <>
          <Box
            sx={{
              width: "1px",
              height: 14,
              backgroundColor: "divider",
              mx: 0.25,
              flexShrink: 0,
            }}
          />
          <ModelChip
            selected
            onClick={handleModelChipClick}
            title="Change model"
          >
            {activeModel}
            <span style={{ fontSize: "0.5rem", opacity: 0.6 }}>▾</span>
          </ModelChip>
          <Popover
            open={Boolean(modelAnchor)}
            anchorEl={modelAnchor}
            onClose={() => setModelAnchor(null)}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: 2,
                  boxShadow: 3,
                  p: 0.5,
                  minWidth: 140,
                },
              },
            }}
          >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
              {currentProvider.models.map((model: string) => (
                <ModelChip
                  key={model}
                  selected={model === activeModel}
                  onClick={() => handleModelSelect(model)}
                >
                  {model}
                </ModelChip>
              ))}
            </Box>
          </Popover>
        </>
      )}

      {usedProvider && (
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.6rem",
            color: "text.disabled",
            ml: "auto",
            fontStyle: "italic",
          }}
        >
          via {usedProvider.provider}/{usedProvider.model}
        </Typography>
      )}
    </Box>
  );
};
