import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type WikipediaProvider } from "../../providers/wikipedia/wikipedia.provider.js";
import { fetchFromWikipedia } from "./fetchFromWikipedia.js";

describe(fetchFromWikipedia.name, () => {
  const wp = mock<WikipediaProvider>();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a LoadedPage with featuredMedia from thumbnail when thumbnail is present", async () => {
    const title = "Albert Einstein";

    wp.articleSummary.mockReturnValueOnce(
      fp.TE.right({
        title: "Albert Einstein",
        titles: {
          canonical: "Albert_Einstein",
          normalized: "Albert Einstein",
        },
        description: "Theoretical physicist",
        thumbnail: {
          source: "https://upload.wikimedia.org/thumb/einstein.jpg",
          width: 320,
          height: 400,
        },
        originalimage: {
          source: "https://upload.wikimedia.org/original/einstein.jpg",
          width: 1200,
          height: 1500,
        },
        extract: "Albert Einstein was a German-born theoretical physicist.",
      }),
    );

    const result = await pipe(fetchFromWikipedia(title)(wp), throwTE);

    expect(wp.articleSummary).toHaveBeenCalledWith(title);
    expect(result.slug).toBe("albert-einstein");
    expect(result.featuredMedia).toBe(
      "https://upload.wikimedia.org/thumb/einstein.jpg",
    );
    expect(result.intro).toBe(
      "Albert Einstein was a German-born theoretical physicist.",
    );
  });

  it("should use originalimage source when thumbnail is absent", async () => {
    const title = "Marie Curie";

    wp.articleSummary.mockReturnValueOnce(
      fp.TE.right({
        title: "Marie Curie",
        titles: {
          canonical: "Marie_Curie",
          normalized: "Marie Curie",
        },
        description: "Physicist and chemist",
        thumbnail: undefined,
        originalimage: {
          source: "https://upload.wikimedia.org/original/curie.jpg",
          width: 800,
          height: 1000,
        },
        extract: "Marie Curie was a Polish and naturalized-French physicist.",
      }),
    );

    const result = await pipe(fetchFromWikipedia(title)(wp), throwTE);

    expect(result.featuredMedia).toBe(
      "https://upload.wikimedia.org/original/curie.jpg",
    );
    expect(result.slug).toBe("marie-curie");
    expect(result.intro).toBe(
      "Marie Curie was a Polish and naturalized-French physicist.",
    );
  });

  it("should return featuredMedia as undefined when neither thumbnail nor originalimage is present", async () => {
    const title = "Unknown Person";

    wp.articleSummary.mockReturnValueOnce(
      fp.TE.right({
        title: "Unknown Person",
        titles: {
          canonical: "Unknown_Person",
          normalized: "Unknown Person",
        },
        description: "Unknown person description",
        thumbnail: undefined,
        originalimage: undefined,
        extract: "Some extract about the unknown person.",
      }),
    );

    const result = await pipe(fetchFromWikipedia(title)(wp), throwTE);

    expect(result.featuredMedia).toBeUndefined();
    expect(result.slug).toBe("unknown-person");
    expect(result.intro).toBe("Some extract about the unknown person.");
  });

  it("should convert canonical title to a slug using getUsernameFromDisplayName", async () => {
    const title = "Isaac Newton";

    wp.articleSummary.mockReturnValueOnce(
      fp.TE.right({
        title: "Isaac Newton",
        titles: {
          canonical: "Isaac_Newton",
          normalized: "Isaac Newton",
        },
        description: "English mathematician and physicist",
        thumbnail: undefined,
        originalimage: undefined,
        extract: "Sir Isaac Newton was an English mathematician.",
      }),
    );

    const result = await pipe(fetchFromWikipedia(title)(wp), throwTE);

    expect(result.slug).toBe("isaac-newton");
  });

  it("should propagate errors from articleSummary", async () => {
    const title = "Nonexistent Article";
    const apiError = new Error("Wikipedia API error: page not found");

    wp.articleSummary.mockReturnValueOnce(fp.TE.left(apiError));

    const either = await pipe(fetchFromWikipedia(title)(wp))();

    expect(fp.E.isLeft(either)).toBe(true);
    if (fp.E.isLeft(either)) {
      expect(either.left).toBe(apiError);
      expect(either.left.message).toBe("Wikipedia API error: page not found");
    }
  });

  it("should use thumbnail source when both thumbnail and originalimage are present", async () => {
    const title = "Charles Darwin";

    wp.articleSummary.mockReturnValueOnce(
      fp.TE.right({
        title: "Charles Darwin",
        titles: {
          canonical: "Charles_Darwin",
          normalized: "Charles Darwin",
        },
        description: "English naturalist",
        thumbnail: {
          source: "https://example.com/thumb/darwin.jpg",
          width: 200,
          height: 250,
        },
        originalimage: {
          source: "https://example.com/original/darwin.jpg",
          width: 2000,
          height: 2500,
        },
        extract: "Charles Robert Darwin was an English naturalist.",
      }),
    );

    const result = await pipe(fetchFromWikipedia(title)(wp), throwTE);

    // thumbnail.source takes precedence over originalimage.source
    expect(result.featuredMedia).toBe("https://example.com/thumb/darwin.jpg");
  });
});
