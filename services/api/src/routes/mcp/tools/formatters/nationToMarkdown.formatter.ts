import { type Nation } from "@liexp/io/lib/http/Nation.js";

/**
 * Format a Nation entity to markdown for AI consumption
 */
export const formatNationToMarkdown = (nation: Nation): string => {
  const lines: string[] = [];

  lines.push(`# Nation: ${nation.name}`);
  lines.push("");
  lines.push(`**ID:** ${nation.id}`);
  lines.push(`**ISO Code:** ${nation.isoCode}`);
  lines.push(`**Created At:** ${nation.createdAt}`);
  lines.push(`**Updated At:** ${nation.updatedAt}`);
  lines.push("");

  if (nation.actors && nation.actors.length > 0) {
    lines.push("## Associated Actors");
    lines.push(
      `This nation has ${nation.actors.length} associated actor(s) with IDs: ${nation.actors.join(", ")}`,
    );
    lines.push("");
  }

  return lines.join("\n");
};
