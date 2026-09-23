import * as fs from "fs";
import path from "path";
import { tool } from "@langchain/core/tools";
import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import type { AgentType } from "@liexp/io/lib/http/Chat.js";
import { type TaskEither } from "fp-ts/lib/TaskEither.js";
import * as z from "zod";
import { ServerError } from "../../../errors/index.js";

const ALL_AGENT_TYPES: readonly AgentType[] = [
  "auto",
  "platform",
  "researcher",
];

export interface Skill {
  name: string;
  description: string;
  /** Extra keywords used to match load_skill task descriptions */
  triggers: string[];
  /** Agent types allowed to see this skill (defaults to all) */
  agents: AgentType[];
  content: string;
}

type Frontmatter = Record<string, string | string[]>;

const unquote = (v: string): string => v.trim().replace(/^["'](.*)["']$/, "$1");

/**
 * Minimal frontmatter parser: supports `key: value`, inline lists
 * `key: [a, b]` and block lists (`key:` followed by `  - item` lines).
 */
const parseFrontmatter = (raw: string): Frontmatter => {
  const fm: Frontmatter = {};
  let listKey: string | null = null;

  for (const line of raw.split("\n")) {
    const item = /^\s+-\s+(.+)$/.exec(line);
    if (item && listKey) {
      (fm[listKey] as string[]).push(unquote(item[1]));
      continue;
    }

    const kv = /^([a-zA-Z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;

    const key = kv[1];
    const val = kv[2].trim();
    listKey = null;

    if (val === "") {
      fm[key] = [];
      listKey = key;
    } else if (val.startsWith("[") && val.endsWith("]")) {
      fm[key] = val
        .slice(1, -1)
        .split(",")
        .map(unquote)
        .filter((s) => s.length > 0);
    } else {
      fm[key] = unquote(val);
    }
  }

  return fm;
};

const asString = (v: string | string[] | undefined): string =>
  typeof v === "string" ? v : "";

const asList = (v: string | string[] | undefined): string[] =>
  Array.isArray(v) ? v : typeof v === "string" && v ? [v] : [];

/**
 * Parse a skill file: extract frontmatter and body (content).
 */
export const parseSkillFile = (raw: string): Skill => {
  const fmMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw);
  if (!fmMatch) {
    throw new Error(`Invalid SKILL.md: missing frontmatter delimiters`);
  }
  const fm = parseFrontmatter(fmMatch[1]);
  const agents = asList(fm.agents);

  return {
    name: asString(fm.name),
    description: asString(fm.description),
    triggers: asList(fm.triggers),
    agents: agents.length > 0 ? (agents as AgentType[]) : [...ALL_AGENT_TYPES],
    content: fmMatch[2],
  };
};

/**
 * Load all skills from .md files in the skills directory.
 * Each file should be named <skill_name>.md and start with a frontmatter block.
 */
export const loadSkills = (
  skillsDir: string,
): TaskEither<ServerError, Skill[]> => {
  return pipe(
    fp.TE.tryCatch(
      () => {
        const mdFiles = fs
          .readdirSync(skillsDir)
          .filter((f) => f.endsWith(".md"))
          .sort();

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
      const invalid = skills.filter(
        (s) =>
          !s.name ||
          !s.description ||
          s.agents.some((a) => !ALL_AGENT_TYPES.includes(a)),
      );
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
 * Keep only the skills visible to the given agent type.
 */
export const skillsForAgent = (skills: Skill[], type: AgentType): Skill[] =>
  skills.filter((s) => s.agents.includes(type));

const STOPWORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "do",
  "for",
  "from",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "my",
  "of",
  "on",
  "or",
  "please",
  "the",
  "this",
  "to",
  "we",
  "what",
  "with",
  "you",
  "want",
  "need",
  "about",
  "some",
]);

const tokenize = (text: string): string[] =>
  text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));

const matches = (queryToken: string, token: string): boolean =>
  token === queryToken ||
  (queryToken.length >= 4 && token.startsWith(queryToken)) ||
  (token.length >= 4 && queryToken.startsWith(token));

export interface SkillMatch {
  skill: Skill;
  score: number;
}

/**
 * Rank skills against a free-text query by keyword overlap.
 * Each query token counts once, at the weight of the best field it matches:
 * name 3, triggers 2, description 1. Zero-score skills are dropped.
 */
export const rankSkills = (skills: Skill[], query: string): SkillMatch[] => {
  const q = tokenize(query);
  if (q.length === 0) return [];

  return skills
    .map((skill) => {
      const fields: [number, string[]][] = [
        [3, tokenize(skill.name)],
        [2, skill.triggers.flatMap(tokenize)],
        [1, tokenize(skill.description)],
      ];
      const score = q.reduce(
        (acc, token) =>
          acc +
          Math.max(
            0,
            ...fields
              .filter(([, tokens]) => tokens.some((t) => matches(token, t)))
              .map(([weight]) => weight),
          ),
        0,
      );
      return { skill, score };
    })
    .filter((m) => m.score > 0)
    .sort(
      (a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name),
    );
};

const formatCatalog = (skills: Skill[]): string =>
  skills.map((s) => `- ${s.name}: ${s.description}`).join("\n");

const normalizeName = (name: string): string =>
  name
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

/**
 * Resolve a load_skill request: exact name first, then keyword search.
 * A search result is loaded directly only when the top match clearly wins.
 */
export const resolveSkill = (
  skills: Skill[],
  nameOrQuery: string,
):
  | { _tag: "Loaded"; skill: Skill; exact: boolean }
  | { _tag: "Candidates"; matches: SkillMatch[] } => {
  const exact = skills.find(
    (s) => normalizeName(s.name) === normalizeName(nameOrQuery),
  );
  if (exact) return { _tag: "Loaded", skill: exact, exact: true };

  const ranked = rankSkills(skills, nameOrQuery);
  const [top, second] = ranked;
  if (top && top.score >= 3 && (!second || top.score >= 2 * second.score)) {
    return { _tag: "Loaded", skill: top.skill, exact: false };
  }
  return { _tag: "Candidates", matches: ranked.slice(0, 3) };
};

/**
 * Create the load_skill tool that agents use to fetch full skill content on demand.
 * Accepts either an exact skill name or a short task description; the latter is
 * matched against the catalog (name, triggers, description).
 */
export function createLoadSkillTool(
  skills: Skill[],
): ReturnType<typeof tool<any, any, any, any>> {
  return tool<any, any, any, any>(
    (input: { skill_name: string }) => {
      const result = resolveSkill(skills, input.skill_name);
      if (result._tag === "Loaded") {
        const header = result.exact
          ? `Loaded skill: ${result.skill.name}`
          : `Loaded skill: ${result.skill.name} (best match for '${input.skill_name}')`;
        return `${header}\n\n${result.skill.content}`;
      }
      if (result.matches.length === 0) {
        return `No skill matched '${input.skill_name}'. Available skills:\n${formatCatalog(skills)}`;
      }
      return `No exact skill named '${input.skill_name}'. Closest matches — call load_skill again with one of these names:\n${result.matches
        .map((m) => `- ${m.skill.name}: ${m.skill.description}`)
        .join("\n")}`;
    },
    {
      name: "load_skill",
      description:
        "Load the full workflow of a skill into your context. Pass the exact skill name from the Available Skills list, or — if unsure which skill fits — a short description of the task (e.g. 'create death event', 'who funded this group'); the best match is loaded or the closest candidates are returned.",
      schema: z.object({
        skill_name: z
          .string()
          .describe("Exact skill name, or a short description of the task"),
      }),
    },
  );
}

/**
 * Build the skills addendum string from the skills visible to an agent.
 * This is injected into the system prompt so the agent knows what skills are available.
 */
export function buildSkillsAddendum(skills: Skill[]): string {
  return `\n\n## Available Skills\n\n${formatCatalog(skills)}\n\nWhen a request matches one of these skills, call \`load_skill(name)\` to read its full workflow BEFORE acting — do not improvise a workflow a skill already defines. If you are unsure which skill fits, call \`load_skill\` with a short description of the task instead of a name.`;
}
