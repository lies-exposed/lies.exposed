import { type Area } from "@liexp/shared/lib/io/http/Area.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";

/**
 * Formats an Area object into structured markdown text that is more easily
 * understood by LLMs compared to raw JSON.
 *
 * This follows the principle that LLMs work better with well-structured text
 * rather than JSON objects for understanding and reasoning about entities.
 */
export const formatAreaToMarkdown = (area: Area): string => {
  const lines: string[] = [];

  // Header with the area's name
  lines.push(`# ${area.label}`);
  lines.push("");

  // Basic information section
  lines.push("## Basic Information");
  lines.push(`- **Label**: ${area.label}`);
  lines.push(`- **Slug**: ${area.slug}`);
  lines.push(`- **ID**: ${area.id}`);
  lines.push(`- **Draft**: ${area.draft ? "Yes" : "No"}`);
  lines.push("");

  // Geometry section
  if (area.geometry) {
    lines.push("## Geography");
    lines.push(`- **Type**: ${area.geometry.type}`);
    if (area.geometry.coordinates && area.geometry.coordinates.length > 0) {
      lines.push(
        `- **Coordinates**: ${area.geometry.coordinates.length} coordinate sets`,
      );
    }
    lines.push("");
  }

  // Featured Image section
  if (area.featuredImage && typeof area.featuredImage === "object") {
    lines.push("## Featured Image");
    lines.push(`- **Label**: ${area.featuredImage.label}`);
    lines.push(`- **Type**: ${area.featuredImage.type}`);
    lines.push(`- **Location**: ${area.featuredImage.location}`);
    if (area.featuredImage.description) {
      lines.push(`- **Description**: ${area.featuredImage.description}`);
    }
    lines.push("");
  }

  // Body section (detailed information)
  if (area.body && isValidValue(area.body)) {
    const bodyText = getTextContents(area.body);
    if (bodyText.trim()) {
      lines.push("## Description");
      lines.push(bodyText.trim());
      lines.push("");
    }
  }

  // Media section
  if (area.media && area.media.length > 0) {
    lines.push("## Media");
    lines.push(`- **Media Count**: ${area.media.length} items`);
    lines.push("");
  }

  // Events section
  if (area.events && area.events.length > 0) {
    lines.push("## Related Events");
    lines.push(`- **Event Count**: ${area.events.length} events`);
    lines.push("");
  }

  // Social Posts section
  if (area.socialPosts && area.socialPosts.length > 0) {
    lines.push("## Social Media");
    lines.push(`- **Social Posts**: ${area.socialPosts.length} posts`);
    lines.push("");
  }

  // Metadata section
  lines.push("## Metadata");
  lines.push(`- **Created**: ${area.createdAt.toISOString()}`);
  lines.push(`- **Updated**: ${area.updatedAt.toISOString()}`);
  if (area.deletedAt) {
    lines.push(`- **Deleted**: ${area.deletedAt.toISOString()}`);
  }

  return lines.join("\n");
};
