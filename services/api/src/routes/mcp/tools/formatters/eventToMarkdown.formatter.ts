import { type Event } from "@liexp/shared/lib/io/http/Events/index.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";

/**
 * Helper to safely extract string values from unknown payload
 */
const getStringValue = (obj: unknown): string | undefined => {
  return typeof obj === "string" ? obj : undefined;
};

/**
 * Helper to safely get array length from unknown payload
 */
const getArrayLength = (obj: unknown): number => {
  return Array.isArray(obj) ? obj.length : 0;
};

/**
 * Formats an Event object into structured markdown text that is more easily
 * understood by LLMs compared to raw JSON.
 *
 * This follows the principle that LLMs work better with well-structured text
 * rather than JSON objects for understanding and reasoning about entities.
 */
export const formatEventToMarkdown = (event: Event): string => {
  const lines: string[] = [];

  // Extract title from payload or use event type
  const payload = event.payload as Record<string, unknown>;
  const title = getStringValue(payload?.title) ?? `${event.type} Event`;

  // Header with the event title
  lines.push(`# ${title}`);
  lines.push("");

  // Basic information section
  lines.push("## Basic Information");
  lines.push(`- **Type**: ${event.type}`);
  lines.push(`- **ID**: ${event.id}`);
  lines.push(`- **Date**: ${event.date.toISOString().split("T")[0]}`);
  lines.push(`- **Draft**: ${event.draft ? "Yes" : "No"}`);
  lines.push("");

  // Event-specific payload information
  lines.push("## Event Details");

  // Add basic payload information that might exist
  const payloadTitle = getStringValue(payload.title);
  if (payloadTitle) {
    lines.push(`- **Title**: ${payloadTitle}`);
  }

  // Add generic payload information based on common fields
  const description = getStringValue(payload.description);
  if (description) {
    lines.push(`- **Description**: ${description}`);
  }

  const location = getStringValue(payload.location);
  if (location) {
    lines.push(`- **Location**: ${location}`);
  }

  const victim = getStringValue(payload.victim);
  if (victim) {
    lines.push(`- **Victim**: ${victim}`);
  }

  const quote = getStringValue(payload.quote);
  if (quote) {
    lines.push(`- **Quote**: "${quote}"`);
  }

  const publisher = getStringValue(payload.publisher);
  if (publisher) {
    lines.push(`- **Publisher**: ${publisher}`);
  }

  // Handle arrays of related entities
  const authorsLength = getArrayLength(payload.authors);
  if (authorsLength > 0) {
    lines.push(`- **Authors**: ${authorsLength} author(s)`);
  }

  const actorsLength = getArrayLength(payload.actors);
  if (actorsLength > 0) {
    lines.push(`- **Actors**: ${actorsLength} actor(s)`);
  }

  const groupsLength = getArrayLength(payload.groups);
  if (groupsLength > 0) {
    lines.push(`- **Groups**: ${groupsLength} group(s)`);
  }

  // Handle transaction-specific fields
  if (typeof payload.total === "number") {
    const currency = getStringValue(payload.currency) ?? "USD";
    lines.push(`- **Amount**: ${payload.total} ${currency}`);
  }

  // Handle dates
  if (payload.endDate) {
    const endDate = new Date(payload.endDate as string);
    if (!isNaN(endDate.getTime())) {
      lines.push(`- **End Date**: ${endDate.toISOString().split("T")[0]}`);
    }
  }

  lines.push("");

  // Excerpt section (summary)
  if (event.excerpt && isValidValue(event.excerpt)) {
    const excerptText = getTextContents(event.excerpt);
    if (excerptText.trim()) {
      lines.push("## Summary");
      lines.push(excerptText.trim());
      lines.push("");
    }
  }

  // Body section (detailed information)
  if (event.body && isValidValue(event.body)) {
    const bodyText = getTextContents(event.body);
    if (bodyText.trim()) {
      lines.push("## Detailed Information");
      lines.push(bodyText.trim());
      lines.push("");
    }
  }

  // Related content sections
  if (event.media && event.media.length > 0) {
    lines.push("## Media");
    lines.push(`- **Media Count**: ${event.media.length} items`);
    lines.push("");
  }

  if (event.links && event.links.length > 0) {
    lines.push("## Links");
    lines.push(`- **Link Count**: ${event.links.length} links`);
    lines.push("");
  }

  if (event.keywords && event.keywords.length > 0) {
    lines.push("## Keywords");
    lines.push(`- **Keyword Count**: ${event.keywords.length} keywords`);
    lines.push("");
  }

  if (event.socialPosts && event.socialPosts.length > 0) {
    lines.push("## Social Media");
    lines.push(`- **Social Posts**: ${event.socialPosts.length} posts`);
    lines.push("");
  }

  // Metadata section
  lines.push("## Metadata");
  lines.push(`- **Created**: ${event.createdAt.toISOString()}`);
  lines.push(`- **Updated**: ${event.updatedAt.toISOString()}`);
  if (event.deletedAt) {
    lines.push(`- **Deleted**: ${event.deletedAt.toISOString()}`);
  }

  return lines.join("\n");
};
