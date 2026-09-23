import path from "path";
import {
  loadSkills,
  resolveSkill,
  skillsForAgent,
  type Skill,
} from "@liexp/backend/lib/providers/ai/tools/skills.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Guards the runtime skill catalog in services/agent/skills:
 * every file parses, names match file names, and typical user requests
 * resolve (via load_skill's search) to the intended skill.
 */
describe("agent skills catalog", () => {
  const skillsDir = path.resolve(import.meta.dirname, "../skills");
  let skills: Skill[];

  beforeAll(async () => {
    skills = await throwTE(loadSkills(skillsDir));
  });

  it("loads skills with unique names", () => {
    expect(skills.length).toBeGreaterThan(0);
    const names = skills.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it("keeps CLI-writing skills away from the researcher", () => {
    const researcher = skillsForAgent(skills, "researcher").map((s) => s.name);
    expect(researcher).not.toContain("event-create");
    expect(researcher).not.toContain("link-ingest");
    expect(researcher).toContain("fact-check-claim");
  });

  it.each([
    ["link-ingest", "save this article url"],
    ["actor-profile", "add a new person with avatar and nationality"],
    ["group-profile", "create organization company"],
    ["event-create", "create a death event"],
    ["event-from-sources", "build one event from several articles"],
    ["event-update-from-source", "update event with new source"],
    ["fact-check-claim", "is it true this claim, fact check"],
    ["dossier", "dossier on this person"],
    ["money-trail", "follow the money who funded"],
    ["timeline-build", "timeline chronology"],
    ["story-write", "write a story draft"],
    ["text-edit-instruction", "rewrite shorten selected text"],
    ["summarize-resource", "summarize this record excerpt"],
    ["media-attach", "attach image pdf media"],
    ["area-geo", "create area with geojson coordinates"],
    ["data-quality-audit", "audit missing data quality"],
    ["dedupe-check", "find duplicate actors"],
  ])("resolves %s from '%s'", (expected, query) => {
    const result = resolveSkill(skillsForAgent(skills, "platform"), query);
    const name =
      result._tag === "Loaded"
        ? result.skill.name
        : result.matches[0]?.skill.name;
    expect(name).toBe(expected);
  });
});
