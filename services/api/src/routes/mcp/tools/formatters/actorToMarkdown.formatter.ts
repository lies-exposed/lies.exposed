import { type Actor } from "@liexp/shared/lib/io/http/Actor.js";
import { getTextContents } from "@liexp/shared/lib/providers/blocknote/getTextContents.js";
import { isValidValue } from "@liexp/shared/lib/providers/blocknote/isValidValue.js";

/**
 * Formats an Actor object into structured markdown text that is more easily
 * understood by LLMs compared to raw JSON.
 *
 * This follows the principle that LLMs work better with well-structured text
 * rather than JSON objects for understanding and reasoning about entities.
 */
export const formatActorToMarkdown = (actor: Actor): string => {
  const lines: string[] = [];

  // Header with the actor's name
  lines.push(`# ${actor.fullName}`);
  lines.push("");

  // Basic information section
  lines.push("## Basic Information");
  lines.push(`- **Full Name**: ${actor.fullName}`);
  lines.push(`- **Username**: ${actor.username}`);
  lines.push(`- **ID**: ${actor.id}`);

  if (actor.bornOn) {
    lines.push(`- **Born**: ${actor.bornOn.toISOString().split("T")[0]}`);
  }

  if (actor.diedOn) {
    lines.push(`- **Died**: ${actor.diedOn.toISOString().split("T")[0]}`);
  }

  if (actor.color) {
    lines.push(`- **Color**: #${actor.color}`);
  }

  lines.push("");

  // Avatar section
  if (actor.avatar) {
    lines.push("## Avatar");
    if (typeof actor.avatar === "string") {
      lines.push(`- Avatar ID: ${actor.avatar}`);
    } else {
      lines.push(`- **Label**: ${actor.avatar.label}`);
      lines.push(`- **Type**: ${actor.avatar.type}`);
      lines.push(`- **Location**: ${actor.avatar.location}`);
      if (actor.avatar.description) {
        lines.push(`- **Description**: ${actor.avatar.description}`);
      }
    }
    lines.push("");
  }

  // Nationalities section
  if (actor.nationalities && actor.nationalities.length > 0) {
    lines.push("## Nationalities");
    actor.nationalities.forEach((nationality) => {
      if (typeof nationality === "string") {
        lines.push(`- ${nationality}`);
      } else {
        lines.push(`- **${nationality.name}** (${nationality.id})`);
      }
    });
    lines.push("");
  }

  // Memberships section
  if (actor.memberIn && actor.memberIn.length > 0) {
    lines.push("## Group Memberships");
    actor.memberIn.forEach((membership) => {
      if (typeof membership === "string") {
        lines.push(`- Member of: ${membership}`);
      } else {
        // Handle group membership objects with more details
        lines.push(`- ${JSON.stringify(membership)}`);
      }
    });
    lines.push("");
  }

  // Excerpt section (biography/summary)
  if (actor.excerpt && isValidValue(actor.excerpt)) {
    const excerptText = getTextContents(actor.excerpt);
    if (excerptText.trim()) {
      lines.push("## Biography/Summary");
      lines.push(excerptText.trim());
      lines.push("");
    }
  }

  // Body section (detailed information)
  if (actor.body && isValidValue(actor.body)) {
    const bodyText = getTextContents(actor.body);
    if (bodyText.trim()) {
      lines.push("## Detailed Information");
      lines.push(bodyText.trim());
      lines.push("");
    }
  }

  // Death event section
  if (actor.death) {
    lines.push("## Death Event");
    lines.push(`- Death Event ID: ${actor.death}`);
    lines.push("");
  }

  // Metadata section
  lines.push("## Metadata");
  lines.push(`- **Created**: ${actor.createdAt.toISOString()}`);
  lines.push(`- **Updated**: ${actor.updatedAt.toISOString()}`);
  if (actor.deletedAt) {
    lines.push(`- **Deleted**: ${actor.deletedAt.toISOString()}`);
  }

  return lines.join("\n");
};
