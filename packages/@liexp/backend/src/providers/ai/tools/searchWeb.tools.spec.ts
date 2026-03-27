import { fp } from "@liexp/core/lib/fp/index.js";
import { describe, expect, it, vi } from "vitest";
import { createSearchWebTool } from "./searchWeb.tools.js";

const createMockContext = (webSearchResult?: any) => ({
  logger: {
    info: { log: vi.fn() },
    debug: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
    extend: vi.fn().mockReturnThis(),
  },
  brave: {
    webSearch: vi.fn().mockImplementation(() =>
      fp.TE.right(
        webSearchResult ?? {
          web: {
            results: [
              {
                url: "https://example.com/article",
                title: "Example Article",
                description: "An article about the topic",
                thumbnail: { original: "https://example.com/thumb.jpg" },
              },
            ],
          },
        },
      ),
    ),
  },
});

describe("createSearchWebTool", () => {
  it("creates a tool with name 'searchWeb'", () => {
    const ctx = createMockContext();
    const tool = createSearchWebTool(ctx as any);
    expect(tool.name).toBe("searchWeb");
  });

  it("has a non-empty description", () => {
    const ctx = createMockContext();
    const tool = createSearchWebTool(ctx as any);
    expect(tool.description.length).toBeGreaterThan(0);
    expect(tool.description).toContain("EXTERNAL WEB");
  });

  it("calls brave.webSearch with the query and keywords combined", async () => {
    const ctx = createMockContext();
    const tool = createSearchWebTool(ctx as any);

    await tool.invoke({
      query: "climate change",
      keywords: ["global", "warming"],
      count: undefined,
      offset: undefined,
      date: undefined,
    });

    expect(ctx.brave.webSearch).toHaveBeenCalledWith(
      "climate changeglobal warming",
      expect.any(Object),
    );
  });

  it("formats results with numbered list and URLs", async () => {
    const ctx = createMockContext();
    const tool = createSearchWebTool(ctx as any);

    const result = await tool.invoke({
      query: "test query",
      keywords: [],
      count: undefined,
      offset: undefined,
      date: undefined,
    });

    expect(result).toContain("1. https://example.com/article");
    expect(result).toContain("Example Article");
    expect(result).toContain("An article about the topic");
    expect(result).toContain("Found 1 URLs");
  });

  it("returns 'No results found' message when results are empty", async () => {
    const ctx = createMockContext({ web: { results: [] } });
    const tool = createSearchWebTool(ctx as any);

    const result = await tool.invoke({
      query: "obscure topic",
      keywords: [],
      count: undefined,
      offset: undefined,
      date: undefined,
    });

    expect(result).toContain('No results found for "obscure topic"');
  });

  it("returns error message string when brave.webSearch fails", async () => {
    const ctx = createMockContext();
    ctx.brave.webSearch = vi
      .fn()
      .mockImplementation(() =>
        fp.TE.left({ name: "BraveError", message: "API limit exceeded" }),
      );
    const tool = createSearchWebTool(ctx as any);

    const result = await tool.invoke({
      query: "test",
      keywords: [],
      count: undefined,
      offset: undefined,
      date: undefined,
    });

    expect(result).toContain("Error searching");
  });

  it("passes count and offset to brave.webSearch when provided", async () => {
    const ctx = createMockContext();
    const tool = createSearchWebTool(ctx as any);

    await tool.invoke({
      query: "test",
      keywords: [],
      count: 5,
      offset: 10,
      date: undefined,
    });

    expect(ctx.brave.webSearch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ count: 5, offset: 10 }),
    );
  });

  it("passes freshness date when date is provided", async () => {
    const ctx = createMockContext();
    const tool = createSearchWebTool(ctx as any);

    await tool.invoke({
      query: "test",
      keywords: [],
      count: undefined,
      offset: undefined,
      date: "2024-01-15",
    });

    expect(ctx.brave.webSearch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ freshness: expect.any(String) }),
    );
  });

  it("passes undefined freshness when no date provided", async () => {
    const ctx = createMockContext();
    const tool = createSearchWebTool(ctx as any);

    await tool.invoke({
      query: "test",
      keywords: [],
      count: undefined,
      offset: undefined,
      date: undefined,
    });

    expect(ctx.brave.webSearch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ freshness: undefined }),
    );
  });

  it("includes thumbnail URL in result when available", async () => {
    const ctx = createMockContext();
    const tool = createSearchWebTool(ctx as any);

    const result = await tool.invoke({
      query: "test",
      keywords: [],
      count: undefined,
      offset: undefined,
      date: undefined,
    });

    expect(result).toContain("https://example.com/thumb.jpg");
  });

  it("formats multiple results with correct numbering", async () => {
    const ctx = createMockContext({
      web: {
        results: [
          {
            url: "https://a.com",
            title: "A",
            description: "desc A",
            thumbnail: null,
          },
          {
            url: "https://b.com",
            title: "B",
            description: "desc B",
            thumbnail: null,
          },
          {
            url: "https://c.com",
            title: "C",
            description: "desc C",
            thumbnail: null,
          },
        ],
      },
    });
    const tool = createSearchWebTool(ctx as any);

    const result = await tool.invoke({
      query: "multi",
      keywords: [],
      count: undefined,
      offset: undefined,
      date: undefined,
    });

    expect(result).toContain("1. https://a.com");
    expect(result).toContain("2. https://b.com");
    expect(result).toContain("3. https://c.com");
    expect(result).toContain("Found 3 URLs");
  });
});
