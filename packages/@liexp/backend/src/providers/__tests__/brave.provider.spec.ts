import { describe, expect, it, vi } from "vitest";
import type { BraveSearch } from "brave-search";
import { ServerError } from "../../errors/ServerError.js";
import { GetBraveProvider } from "../brave.provider.js";

describe("GetBraveProvider", () => {
  const mockClient = {
    webSearch: vi.fn(),
  } as unknown as BraveSearch;

  it("returns a BraveProvider with _client and webSearch method", () => {
    const provider = GetBraveProvider(mockClient);
    expect(provider._client).toBe(mockClient);
    expect(typeof provider.webSearch).toBe("function");
  });

  it("calls client.webSearch with query and default options", async () => {
    const mockResponse = { web: { results: [] } };
    (mockClient.webSearch as ReturnType<BraveSearch['webSearch']>).mockResolvedValue(mockResponse);

    const provider = GetBraveProvider(mockClient);
    const result = await provider.webSearch("test query")();

    expect(result._tag).toBe("Right");
    expect(mockClient.webSearch).toHaveBeenCalledWith("test query", {
      result_filter: "web,news",
      safesearch: "off",
    });
  });

  it("merges custom options with defaults", async () => {
    const mockResponse = { web: { results: [] } };
    (mockClient.webSearch as ReturnType<BraveSearch['webSearch']>).mockResolvedValue(mockResponse);

    const provider = GetBraveProvider(mockClient);
    await provider.webSearch("test query", { count: 10 })();

    expect(mockClient.webSearch).toHaveBeenCalledWith("test query", {
      result_filter: "web,news",
      safesearch: "off",
      count: 10,
    });
  });

  it("returns Left on client error", async () => {
    (mockClient.webSearch as ReturnType<BraveSearch['webSearch']>).mockRejectedValue(new Error("API error"));

    const provider = GetBraveProvider(mockClient);
    const result = await provider.webSearch("test query")();

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(ServerError);
    }
  });
});
