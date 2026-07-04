import * as fs from "fs";
import path from "path";
import { tool } from "@langchain/core/tools";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import * as z from "zod";
import { ServerError } from "../../../errors/index.js";

export interface Skill {
  name: string;
  description: string;
  content: string;
}

/**
 * Parse a SKILL.md file: extract frontmatter (name, description) and body (content).
 */
const parseSkillFile = (raw: string): Skill => {
  const fmMatch = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/.exec(raw);
  if (!fmMatch) {
    throw new Error(`Invalid SKILL.md: missing frontmatter delimiters`);
  }
  const fmRaw = fmMatch[1];
  const content = fmMatch[2];

  const lines = fmRaw.split("\n");
  let name = "";
  let description = "";
  for (const line of lines) {
    const m = /^(name|description):\s*(.+)$/.exec(line);
    if (m) {
      const key = m[1] as "name" | "description";
      const val = m[2].trim();
      if (key === "name") name = val;
      else if (key === "description") description = val;
    }
  }

  return { name, description, content };
};

/**
 * Load all skills from .md files in the skills directory.
 * Each file should be named <skill_name>.md and contain OpenAI-style frontmatter.
 */
export const loadSkills = (
  skillsDir: string,
): TaskEither<ServerError, Skill[]> => {
  return pipe(
    fp.TE.tryCatch(
      () => {
        const mdFiles = fs
          .readdirSync(skillsDir)
          .filter((f) => f.endsWith(".md"));

        const skills = mdFiles.map((file) =>
          parseSkillFile(
            fs.readFileSync(path.resolve(skillsDir, file), "utf-8"),
          ),
        );

        return Promise.resolve(skills);
      },
      (e) => ServerError.fromUnknown(e),
    ),
    fp.TE.chain((skills) => {
      const invalid = skills.filter((s) => !s.name || !s.description);
      if (invalid.length > 0) {
        return fp.TE.left(
          ServerError.fromUnknown(
            new Error(
              `Invalid skills: ${invalid.map((s) => `"${s.name || "(no name)"}"`).join(", ")}`,
            ),
          ),
        );
      }
      return fp.TE.right(skills);
    }),
  );
};

/**
 * Create the load_skill tool that agents use to fetch full skill content on demand.
 */
export function createLoadSkillTool(
  skills: Skill[],
): ReturnType<typeof tool<any, any, any, any>> {
  return tool<any, any, any, any>(
    (input: { skill_name: string }) => {
      const skill = skills.find((s) => s.name === input.skill_name);
      if (!skill) {
        const available = skills.map((s) => s.name).join(", ");
        return `Skill '${input.skill_name}' not found. Available skills: ${available}`;
      }
      return `Loaded skill: ${skill.name}\n\n${skill.content}`;
    },
    {
      name: "load_skill",
      description:
        "Load the full content of a skill into the agent's context. Use this when you need detailed instructions for handling a specific type of request. Only the skill descriptions are visible in the system prompt — call this tool to get the full workflow.",
      schema: z.object({
        skill_name: z.string().describe("The name of the skill to load"),
      }),
    },
  );
}

/**
 * Build the skills addendum string from all registered skills.
 * This is injected into the system prompt so the agent knows what skills are available.
 */
export function buildSkillsAddendum(skills: Skill[]): string {
  const skillsList = skills
    .map((s) => `- **${s.name}**: ${s.description}`)
    .join("\n");

  return `\n\n## Available Skills\n\n${skillsList}\n\nWhen a request matches one of these skills, call \`load_skill(name)\` to read its full workflow BEFORE acting — do not improvise a workflow a skill already defines.`;
}
