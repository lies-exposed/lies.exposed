import { describe, expect, it } from "vitest";
import {
  buildSkillsAddendum,
  createLoadSkillTool,
  parseSkillFile,
  rankSkills,
  resolveSkill,
  skillsForAgent,
  type Skill,
} from "./skills.js";

const makeSkill = (s: Partial<Skill> & { name: string }): Skill => ({
  description: `${s.name} description`,
  triggers: [],
  agents: ["auto", "platform", "researcher"],
  content: `# ${s.name}`,
  ...s,
});

const skills: Skill[] = [
  makeSkill({
    name: "event-create",
    description: "Create an event of the right type",
    triggers: ["death", "transaction", "paid", "quote"],
    agents: ["auto", "platform"],
  }),
  makeSkill({
    name: "money-trail",
    description: "Follow the money across transactions",
    triggers: ["funding", "funded", "donor"],
  }),
  makeSkill({
    name: "text-edit-instruction",
    description: "Rewrite a selected passage",
    triggers: ["rewrite", "shorten", "translate"],
  }),
];

describe("parseSkillFile", () => {
  it("parses scalar, inline list and block list frontmatter", () => {
    const skill = parseSkillFile(
      [
        "---",
        "name: my-skill",
        'description: "Does things"',
        "triggers: [one, two words, 'three']",
        "agents:",
        "  - platform",
        "  - auto",
        "---",
        "# Body",
        "",
      ].join("\n"),
    );

    expect(skill).toEqual({
      name: "my-skill",
      description: "Does things",
      triggers: ["one", "two words", "three"],
      agents: ["platform", "auto"],
      content: "# Body\n",
    });
  });

  it("defaults agents to every agent type", () => {
    const skill = parseSkillFile("---\nname: a\ndescription: b\n---\nbody");
    expect(skill.agents).toEqual(["auto", "platform", "researcher"]);
    expect(skill.triggers).toEqual([]);
  });

  it("throws without frontmatter", () => {
    expect(() => parseSkillFile("# no frontmatter")).toThrow();
  });
});

describe("skillsForAgent", () => {
  it("hides skills not declared for the agent type", () => {
    expect(skillsForAgent(skills, "researcher").map((s) => s.name)).toEqual([
      "money-trail",
      "text-edit-instruction",
    ]);
  });
});

describe("rankSkills", () => {
  it("ranks by name, triggers and description", () => {
    expect(rankSkills(skills, "who funded this group")[0].skill.name).toBe(
      "money-trail",
    );
    expect(rankSkills(skills, "create a death event")[0].skill.name).toBe(
      "event-create",
    );
  });

  it("returns nothing for stopword-only queries", () => {
    expect(rankSkills(skills, "how do I")).toEqual([]);
  });
});

describe("resolveSkill", () => {
  it("matches exact names ignoring case and separators", () => {
    const r = resolveSkill(skills, "Event_Create");
    expect(r).toMatchObject({ _tag: "Loaded", exact: true });
  });

  it("loads the best match when it clearly wins", () => {
    const r = resolveSkill(skills, "rewrite and shorten the selected text");
    expect(r._tag).toBe("Loaded");
    if (r._tag === "Loaded") {
      expect(r.skill.name).toBe("text-edit-instruction");
      expect(r.exact).toBe(false);
    }
  });

  it("returns candidates when the match is ambiguous", () => {
    const r = resolveSkill(skills, "transaction");
    expect(r._tag).toBe("Candidates");
  });
});

describe("createLoadSkillTool", () => {
  it("returns the catalog when nothing matches", async () => {
    const out: string = await createLoadSkillTool(skills).invoke({
      skill_name: "zzz",
    });
    expect(out).toContain("No skill matched");
    expect(out).toContain("- money-trail:");
  });

  it("returns the skill body for an exact name", async () => {
    const out: string = await createLoadSkillTool(skills).invoke({
      skill_name: "money-trail",
    });
    expect(out).toBe("Loaded skill: money-trail\n\n# money-trail");
  });
});

describe("buildSkillsAddendum", () => {
  it("lists every skill", () => {
    const addendum = buildSkillsAddendum(skills);
    skills.forEach((s) => expect(addendum).toContain(`- ${s.name}:`));
  });
});
