import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "../mui/index.js";
import { createTheme } from "@mui/material/styles";
import { ProviderSelector, type ProviderInfo, type AIProvider } from "./ProviderSelector.js";

// Create a test theme
const testTheme = createTheme();

// Mock provider data
const mockProviders = [
  {
    provider: "openai" as AIProvider,
    info: {
      name: "OpenAI",
      description: "GPT-4 and GPT-4o models from OpenAI",
      available: true,
      models: ["gpt-4", "gpt-4o"],
      defaultModel: "gpt-4",
      baseURL: "https://api.openai.com/v1",
      requiresApiKey: true,
    } as ProviderInfo,
  },
  {
    provider: "anthropic" as AIProvider,
    info: {
      name: "Anthropic",
      description: "Claude models from Anthropic",
      available: true,
      models: [
        "claude-sonnet-4-20250514",
        "claude-3-7-sonnet-latest",
        "claude-3-5-haiku-latest",
      ],
      defaultModel: "claude-sonnet-4-20250514",
      baseURL: "https://api.anthropic.com",
      requiresApiKey: true,
    } as ProviderInfo,
  },
  {
    provider: "xai" as AIProvider,
    info: {
      name: "XAI",
      description: "Grok model from XAI",
      available: false,
      models: ["grok-4-fast"],
      defaultModel: "grok-4-fast",
      baseURL: "https://api.x.ai",
      requiresApiKey: true,
    } as ProviderInfo,
  },
];

const Wrapper: React.FC<React.PropsWithChildren> = ({ children }) => (
  <ThemeProvider theme={testTheme}>
    <CssBaseline />
    {children}
  </ThemeProvider>
);

describe("ProviderSelector", () => {
  let onProviderChange: ReturnType<typeof vi.fn>;
  let onModelChange: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onProviderChange = vi.fn();
    onModelChange = vi.fn();
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ providers: mockProviders }),
      } as Response)
    );
  });

  describe("Loading state", () => {
    it("should show loading spinner initially", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      expect(screen.getByText(/loading providers/i)).toBeInTheDocument();
    });

    it("should hide loading spinner after providers load", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText(/loading providers/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Provider fetching", () => {
    it("should fetch providers from default URL on mount", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/api/proxy/agent/providers");
      });
    });

    it("should fetch providers from custom URL if provided", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
            providersUrl="/custom/providers/url"
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith("/custom/providers/url");
      });
    });
  });

  describe("Auto-selection of first provider", () => {
    it("should auto-select first available provider when none is selected", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(onProviderChange).toHaveBeenCalledWith("openai");
        expect(onModelChange).toHaveBeenCalledWith("gpt-4");
      });
    });

    it("should not auto-select if provider is already selected", async () => {
      const { rerender } = render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="anthropic"
            selectedModel="claude-sonnet-4-20250514"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        // Should fetch providers but not trigger callbacks
        expect(global.fetch).toHaveBeenCalled();
      });

      const callCount = (global.fetch as any).mock.calls.length;

      // Rerender with same selection
      rerender(
        <Wrapper>
          <ProviderSelector
            selectedProvider="anthropic"
            selectedModel="claude-sonnet-4-20250514"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      // Fetch call count should remain the same
      expect((global.fetch as any).mock.calls.length).toBe(callCount);
    });
  });

  describe("Provider dropdown", () => {
    it("should render all available providers", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
        expect(screen.getByText("Anthropic")).toBeInTheDocument();
        expect(screen.getByText(/XAI/)).toBeInTheDocument();
      });
    });

    it("should show unavailable status for unavailable providers", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/XAI.*unavailable/)).toBeInTheDocument();
      });
    });

    it("should change provider when user selects different option", async () => {
      const user = userEvent.setup();

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      // Open provider select
      const providerSelect = screen.getByLabelText("Provider");
      await user.click(providerSelect);

      // Click Anthropic option
      const anthropicOption = screen.getByRole("option", { name: /Anthropic/ });
      await user.click(anthropicOption);

      expect(onProviderChange).toHaveBeenCalledWith("anthropic");
    });

    it("should auto-select default model when provider changes", async () => {
      const user = userEvent.setup();

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      // Reset mock to track new calls
      (onProviderChange as any).mockClear();
      (onModelChange as any).mockClear();

      // Open provider select and change to Anthropic
      const providerSelect = screen.getByLabelText("Provider");
      await user.click(providerSelect);

      const anthropicOption = screen.getByRole("option", { name: /Anthropic/ });
      await user.click(anthropicOption);

      expect(onProviderChange).toHaveBeenCalledWith("anthropic");
      expect(onModelChange).toHaveBeenCalledWith("claude-sonnet-4-20250514");
    });
  });

  describe("Model dropdown", () => {
    it("should render model select when models are available", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText("Model")).toBeInTheDocument();
      });
    });

    it("should show all models for selected provider", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        const modelSelect = screen.getByLabelText("Model");
        expect(modelSelect).toBeInTheDocument();
      });

      const modelSelect = screen.getByLabelText("Model");
      await userEvent.click(modelSelect);

      expect(screen.getByRole("option", { name: /gpt-4o/ })).toBeInTheDocument();
    });

    it("should change model when user selects different option", async () => {
      const user = userEvent.setup();

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByLabelText("Model")).toBeInTheDocument();
      });

      // Reset mock to track new calls
      (onModelChange as any).mockClear();

      // Open model select and change model
      const modelSelect = screen.getByLabelText("Model");
      await user.click(modelSelect);

      const gpt4oOption = screen.getByRole("option", { name: /gpt-4o/ });
      await user.click(gpt4oOption);

      expect(onModelChange).toHaveBeenCalledWith("gpt-4o");
    });
  });

  describe("Compact mode", () => {
    it("should render without container styling when compact is true", async () => {
      const { container } = render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
            compact={true}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("OpenAI")).toBeInTheDocument();
      });

      // In compact mode, there should be no provider description or title
      expect(screen.queryByText("AI Provider")).not.toBeInTheDocument();
    });

    it("should render with container and title when compact is false", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
            compact={false}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByText("AI Provider")).toBeInTheDocument();
      });
    });
  });

  describe("Description display", () => {
    it("should show provider description when showDescription is true", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
            showDescription={true}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText("GPT-4 and GPT-4o models from OpenAI")
        ).toBeInTheDocument();
      });
    });

    it("should hide provider description when showDescription is false", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
            showDescription={false}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(
          screen.queryByText("GPT-4 and GPT-4o models from OpenAI")
        ).not.toBeInTheDocument();
      });
    });
  });

  describe("Error handling", () => {
    it("should display error message when fetch fails", async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error("Network error"))
      );

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it("should display message when no providers are available", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ providers: [] }),
        } as Response)
      );

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(
          screen.getByText(/No providers available/i)
        ).toBeInTheDocument();
      });
    });

    it("should display warning alert for non-OK response status", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
        } as Response)
      );

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/Failed to fetch providers/i)).toBeInTheDocument();
      });
    });
  });
});
