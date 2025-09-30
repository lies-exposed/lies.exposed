import { type Media } from "@liexp/shared/lib/io/http/Media/Media.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";

/**
 * Formats a Media object into structured markdown text that is more easily
 * understood by LLMs compared to raw JSON.
 *
 * This follows the principle that LLMs work better with well-structured text
 * rather than JSON objects for understanding and reasoning about entities.
 */
export const formatMediaToMarkdown = (media: Media): string => {
  const lines: string[] = [];

  // Header with the media label
  const title = media.label ?? `${media.type} Media`;
  lines.push(`# ${title}`);
  lines.push("");

  // Basic information section
  lines.push("## Basic Information");
  lines.push(`- **ID**: ${media.id}`);
  lines.push(`- **Type**: ${media.type}`);
  if (media.label) {
    lines.push(`- **Label**: ${media.label}`);
  }
  if (media.thumbnail) {
    lines.push(`- **Has Thumbnail**: Yes`);
  }
  lines.push("");

  // File information
  lines.push("## File Details");
  if (media.location) {
    lines.push(`- **Location**: ${media.location}`);
  }
  if (media.extra) {
    // Extract common file information from extra
    const extra = media.extra as Record<string, unknown>;
    if (extra.size && typeof extra.size === "number") {
      lines.push(`- **File Size**: ${extra.size} bytes`);
    }
    if (extra.width && typeof extra.width === "number") {
      lines.push(`- **Width**: ${extra.width}px`);
    }
    if (extra.height && typeof extra.height === "number") {
      lines.push(`- **Height**: ${extra.height}px`);
    }
    if (extra.duration && typeof extra.duration === "number") {
      lines.push(`- **Duration**: ${extra.duration} seconds`);
    }
  }
  lines.push("");

  // Description section
  if (media.description && isValidValue(media.description)) {
    const descriptionText = getTextContents(media.description);
    if (descriptionText.trim()) {
      lines.push("## Description");
      lines.push(descriptionText.trim());
      lines.push("");
    }
  }

  // Related content sections
  if (media.events && media.events.length > 0) {
    lines.push("## Related Events");
    lines.push(`- **Event Count**: ${media.events.length} event(s)`);
    lines.push("");
  }

  if (media.keywords && media.keywords.length > 0) {
    lines.push("## Keywords");
    lines.push(`- **Keyword Count**: ${media.keywords.length} keyword(s)`);
    lines.push("");
  }

  if (media.links && media.links.length > 0) {
    lines.push("## Related Links");
    lines.push(`- **Link Count**: ${media.links.length} link(s)`);
    lines.push("");
  }

  if (media.areas && media.areas.length > 0) {
    lines.push("## Related Areas");
    lines.push(`- **Area Count**: ${media.areas.length} area(s)`);
    lines.push("");
  }

  // Metadata section
  lines.push("## Metadata");
  lines.push(`- **Created**: ${media.createdAt.toISOString()}`);
  lines.push(`- **Updated**: ${media.updatedAt.toISOString()}`);
  if (media.deletedAt) {
    lines.push(`- **Deleted**: ${media.deletedAt.toISOString()}`);
  }

  return lines.join("\n");
};
