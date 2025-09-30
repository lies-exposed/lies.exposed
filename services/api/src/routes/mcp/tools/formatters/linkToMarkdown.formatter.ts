import { type Link } from "@liexp/shared/lib/io/http/Link.js";

/**
 * Formats a Link object into structured markdown text that is more easily
 * understood by LLMs compared to raw JSON.
 *
 * This follows the principle that LLMs work better with well-structured text
 * rather than JSON objects for understanding and reasoning about entities.
 */
export const formatLinkToMarkdown = (link: Link): string => {
  const lines: string[] = [];

  // Header with the link title
  lines.push(`# ${link.title}`);
  lines.push("");

  // Basic information section
  lines.push("## Basic Information");
  lines.push(`- **Title**: ${link.title}`);
  lines.push(`- **ID**: ${link.id}`);
  lines.push(`- **URL**: ${link.url}`);
  lines.push(`- **Provider**: ${link.provider}`);
  lines.push("");

  // Publication information
  if (link.publishDate) {
    lines.push("## Publication");
    lines.push(
      `- **Published**: ${link.publishDate.toISOString().split("T")[0]}`,
    );
    lines.push("");
  }

  // Featured image
  if (link.image) {
    lines.push("## Featured Image");
    lines.push(`- **Has Image**: Yes`);
    lines.push("");
  }

  // Description section
  if (link.description) {
    lines.push("## Description");
    lines.push(link.description);
    lines.push("");
  }

  // Provider information
  if (link.provider) {
    lines.push("## Provider");
    lines.push(`- **Provider ID**: ${link.provider}`);
    lines.push("");
  }

  // Creator information
  if (link.creator) {
    lines.push("## Creator");
    lines.push(`- **Creator ID**: ${link.creator}`);
    lines.push("");
  }

  // Related content sections
  if (link.events && link.events.length > 0) {
    lines.push("## Related Events");
    lines.push(`- **Event Count**: ${link.events.length} event(s)`);
    lines.push("");
  }

  if (link.keywords && link.keywords.length > 0) {
    lines.push("## Keywords");
    lines.push(`- **Keyword Count**: ${link.keywords.length} keyword(s)`);
    lines.push("");
  }

  if (link.socialPosts && link.socialPosts.length > 0) {
    lines.push("## Social Media");
    lines.push(`- **Social Posts**: ${link.socialPosts.length} post(s)`);
    lines.push("");
  }

  // Metadata section
  lines.push("## Metadata");
  lines.push(`- **Created**: ${link.createdAt.toISOString()}`);
  lines.push(`- **Updated**: ${link.updatedAt.toISOString()}`);
  if (link.deletedAt) {
    lines.push(`- **Deleted**: ${link.deletedAt.toISOString()}`);
  }

  return lines.join("\n");
};
