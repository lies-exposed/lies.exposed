import axios from "axios";

interface WikipediaSearchPage {
  id: number;
  key: string;
  title: string;
  description: string | null;
  thumbnail: { url: string } | null;
}

interface WikipediaArticleSummary {
  title: string;
  thumbnail?: { source: string; width: number; height: number };
  originalimage?: { source: string; width: number; height: number };
}

const WIKIPEDIA_BASE = "https://en.wikipedia.org";

const WIKIPEDIA_HEADERS = {
  "User-Agent":
    "lies.exposed/1.0 (https://lies.exposed; dev.ascariandrea@gmail.com) axios",
};

/**
 * Searches Wikipedia for a query and returns the best-matching image URL.
 * Throws if no results or no image are found.
 */
export const searchWikipediaImageUrl = async (
  query: string,
): Promise<string> => {
  const searchRes = await axios.get<{ pages: WikipediaSearchPage[] }>(
    `${WIKIPEDIA_BASE}/w/rest.php/v1/search/page`,
    { params: { q: query, limit: 5 }, headers: WIKIPEDIA_HEADERS },
  );
  const pages = searchRes.data.pages;
  if (!pages || pages.length === 0) {
    throw new Error(
      `No Wikipedia results found for "${query}". Try a more complete name.`,
    );
  }

  const summaryRes = await axios.get<WikipediaArticleSummary>(
    `${WIKIPEDIA_BASE}/api/rest_v1/page/summary/${encodeURIComponent(pages[0].title.replace(/ /g, "_"))}`,
    { headers: WIKIPEDIA_HEADERS },
  );
  const article = summaryRes.data;
  // SVG (common for logos) is not a supported media type: fall back to the
  // PNG rendition Wikipedia serves as thumbnail.
  const original = article.originalimage;
  const image =
    original && !/\.svg(\?|$)/i.test(original.source)
      ? original
      : (article.thumbnail ?? original);
  if (!image) {
    throw new Error(`No image found on Wikipedia for "${article.title}"`);
  }
  return image.source;
};

/**
 * Derives the platform media MIME type from an image URL.
 * Supported image types are image/jpeg and image/png only; SVG thumbnails
 * (`.svg.png`) are PNG renditions.
 */
export const imageTypeFromUrl = (url: string): "image/jpeg" | "image/png" => {
  const path = url.split(/[?#]/)[0].toLowerCase();
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  throw new Error(
    `Unsupported image format for ${url}: only jpeg and png are supported`,
  );
};
