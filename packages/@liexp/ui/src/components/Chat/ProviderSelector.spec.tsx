/* eslint-disable no-restricted-imports */
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { CssBaseline } from "../mui/index.js";
import {
  ProviderSelector,
  type ProviderInfo,
} from "./ProviderSelector.js";

// Create a test theme
const testTheme = createTheme();

// Mock provider data - matches the ProviderInfo interface expected by the component
const mockProviders = [
  {
    name: "openai",
    description: "GPT-4 and GPT-4o models from OpenAI",
    available: true,
    models: ["gpt-4", "gpt-4o"],
    defaultModel: "gpt-4",
  } as ProviderInfo,
  {
    name: "anthropic",
    description: "Claude models from Anthropic",
    available: true,
    models: [
      "claude-sonnet-4-20250514",
      "claude-3-7-sonnet-latest",
      "claude-3-5-haiku-latest",
    ],
    defaultModel: "claude-sonnet-4-20250514",
  } as ProviderInfo,
  {
    name: "xai",
    description: "Grok model from XAI",
    available: false,
    models: ["grok-4-fast"],
    defaultModel: "grok-4-fast",
  } as ProviderInfo,
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
      } as Response),
    );
  });

  describe("Loading state", () => {
    it("should show loading spinner initially", () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>,
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
        </Wrapper>,
      );

      await waitFor(() => {
        expect(
          screen.queryByText(/loading providers/i),
        ).not.toBeInTheDocument();
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
        </Wrapper>,
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/api/proxy/agent/providers",
          expect.objectContaining({ headers: expect.any(Object) }),
        );
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
        </Wrapper>,
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "/custom/providers/url",
          expect.objectContaining({ headers: expect.any(Object) }),
        );
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
        </Wrapper>,
      );

      await waitFor(() => {
        expect(onProviderChange).toHaveBeenCalledWith("openai");
        expect(onModelChange).toHaveBeenCalledWith("gpt-4");
      });
    });

    it("should not auto-select if provider is already selected", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="anthropic"
            selectedModel="claude-sonnet-4-20250514"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });

      // Should not call onProviderChange since one is already selected
      expect(onProviderChange).not.toHaveBeenCalled();
    });
  });

  describe("Provider chips", () => {
    it("should render all providers as chips", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("openai")).toBeInTheDocument();
        expect(screen.getByText("anthropic")).toBeInTheDocument();
        expect(screen.getByText("xai")).toBeInTheDocument();
      });
    });

    it("should change provider when user clicks a chip", async () => {
      const user = userEvent.setup();

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("anthropic")).toBeInTheDocument();
      });

      onProviderChange.mockClear();
      onModelChange.mockClear();

      await user.click(screen.getByText("anthropic"));

      expect(onProviderChange).toHaveBeenCalledWith("anthropic");
      expect(onModelChange).toHaveBeenCalledWith("claude-sonnet-4-20250514");
    });
  });

  describe("Model chip", () => {
    it("should render active model as a chip", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("gpt-4")).toBeInTheDocument();
      });
    });

    it("should open model popover when model chip is clicked", async () => {
      const user = userEvent.setup();

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("gpt-4")).toBeInTheDocument();
      });

      // Click the model chip to open popover
      await user.click(screen.getByTitle("Change model"));

      // Popover should show all models
      await waitFor(() => {
        expect(screen.getByText("gpt-4o")).toBeInTheDocument();
      });
    });

    it("should change model when user selects from popover", async () => {
      const user = userEvent.setup();

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText("gpt-4")).toBeInTheDocument();
      });

      onModelChange.mockClear();

      // Open model popover
      await user.click(screen.getByTitle("Change model"));

      // Select gpt-4o
      await waitFor(() => {
        expect(screen.getByText("gpt-4o")).toBeInTheDocument();
      });
      await user.click(screen.getByText("gpt-4o"));

      expect(onModelChange).toHaveBeenCalledWith("gpt-4o");
    });
  });

  describe("Error handling", () => {
    it("should display error message when fetch fails", async () => {
      global.fetch = vi.fn(() => Promise.reject(new Error("Network error")));

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText(/Network error/)).toBeInTheDocument();
      });
    });

    it("should render nothing when no providers are available", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ providers: [] }),
        } as Response),
      );

      const { container } = render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });

      // Should render nothing (null) for empty providers
      expect(container.querySelector("button")).toBeNull();
    });

    it("should display warning alert for non-OK response status", async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.resolve({}),
        } as Response),
      );

      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider={null}
            selectedModel={null}
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
          />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to fetch providers/i),
        ).toBeInTheDocument();
      });
    });
  });

  describe("Used provider display", () => {
    it("should show used provider info when provided", async () => {
      render(
        <Wrapper>
          <ProviderSelector
            selectedProvider="openai"
            selectedModel="gpt-4"
            onProviderChange={onProviderChange}
            onModelChange={onModelChange}
            usedProvider={{ provider: "openai", model: "gpt-4o" }}
          />
        </Wrapper>,
      );

      await waitFor(() => {
        expect(screen.getByText(/via openai\/gpt-4o/)).toBeInTheDocument();
      });
    });
  });
});
