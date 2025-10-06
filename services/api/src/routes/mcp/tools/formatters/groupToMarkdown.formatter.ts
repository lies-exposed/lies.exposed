import { type Group } from "@liexp/shared/lib/io/http/Group.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";

/**
 * Formats a Group object into structured markdown text that is more easily
 * understood by LLMs compared to raw JSON.
 *
 * This follows the principle that LLMs work better with well-structured text
 * rather than JSON objects for understanding and reasoning about entities.
 */
export const formatGroupToMarkdown = (group: Group): string => {
  const lines: string[] = [];

  // Header with the group name
  lines.push(`# ${group.name}`);
  lines.push("");

  // Basic information section
  lines.push("## Basic Information");
  lines.push(`- **Name**: ${group.name}`);
  lines.push(`- **ID**: ${group.id}`);
  lines.push(`- **Color**: ${group.color}`);
  if (group.subGroups && group.subGroups.length > 0) {
    lines.push(`- **Sub-Groups**: ${group.subGroups.length} sub-group(s)`);
  }
  lines.push("");

  // Avatar section
  if (group.avatar) {
    lines.push("## Avatar");
    lines.push(`- **Has Avatar**: Yes`);
    lines.push("");
  }

  // Membership section
  if (group.members && group.members.length > 0) {
    lines.push("## Membership");
    lines.push(`- **Member Count**: ${group.members.length} member(s)`);
    lines.push("");
  }

  // Sub-groups section
  if (group.subGroups && group.subGroups.length > 0) {
    lines.push("## Sub-Groups");
    lines.push(`- **Sub-Group Count**: ${group.subGroups.length} sub-group(s)`);
    lines.push("");
  }

  // Date information
  if (group.startDate || group.endDate) {
    lines.push("## Timeline");
    if (group.startDate) {
      lines.push(
        `- **Start Date**: ${group.startDate.toISOString().split("T")[0]}`,
      );
    }
    if (group.endDate) {
      lines.push(
        `- **End Date**: ${group.endDate.toISOString().split("T")[0]}`,
      );
    }
    lines.push("");
  }

  // Organization details
  lines.push("## Organization Details");
  lines.push(`- **Kind**: ${group.kind}`);
  if (group.username) {
    lines.push(`- **Username**: ${group.username}`);
  }
  lines.push("");

  // Body section (detailed information)
  if (group.body && isValidValue(group.body)) {
    const bodyText = getTextContents(group.body);
    if (bodyText.trim()) {
      lines.push("## Description");
      lines.push(bodyText.trim());
      lines.push("");
    }
  }

  // Excerpt section (summary)
  if (group.excerpt && isValidValue(group.excerpt)) {
    const excerptText = getTextContents(group.excerpt);
    if (excerptText.trim()) {
      lines.push("## Summary");
      lines.push(excerptText.trim());
      lines.push("");
    }
  }

  // Metadata section
  lines.push("## Metadata");
  lines.push(`- **Created**: ${group.createdAt.toISOString()}`);
  lines.push(`- **Updated**: ${group.updatedAt.toISOString()}`);
  if (group.deletedAt) {
    lines.push(`- **Deleted**: ${group.deletedAt.toISOString()}`);
  }

  return lines.join("\n");
};
