import * as O from "effect/Option";
import { describe, expect, it } from "vitest";
import { buildCreatePayload, buildEditPayload } from "../eventPayload.js";

describe("eventPayload", () => {
  describe("buildCreatePayload", () => {
    it("maps Uncategorized participants, location and endDate", () => {
      const p = buildCreatePayload("Uncategorized", {
        title: "t",
        actors: ["a1"],
        groups: ["g1"],
        location: "area-1",
        endDate: "2024-02-01",
      });
      expect(p.title).toBe("t");
      expect(p.actors).toEqual(["a1"]);
      expect(p.groups).toEqual(["g1"]);
      expect(p.groupsMembers).toEqual([]);
      expect(O.getOrUndefined(p.location as O.Option<string>)).toBe("area-1");
      expect(O.getOrUndefined(p.endDate as O.Option<Date>)?.toISOString()).toBe(
        new Date("2024-02-01").toISOString(),
      );
    });

    it("maps Death victim with optional location as Option", () => {
      const p = buildCreatePayload("Death", { victim: "a1" });
      expect(p.victim).toBe("a1");
      expect(O.isNone(p.location as O.Option<string>)).toBe(true);
    });

    it("maps Transaction total/from/to", () => {
      const p = buildCreatePayload("Transaction", {
        title: "t",
        total: 10,
        currency: "USD",
        from: { type: "Actor", id: "a1" },
        to: { type: "Group", id: "g1" },
      });
      expect(p).toEqual({
        title: "t",
        total: 10,
        currency: "USD",
        from: { type: "Actor", id: "a1" },
        to: { type: "Group", id: "g1" },
      });
    });

    it("maps Book media, Patent owners and Documentary nested fields", () => {
      expect(
        buildCreatePayload("Book", { title: "b", pdf: "m1", audio: "m2" }),
      ).toMatchObject({ media: { pdf: "m1", audio: "m2" }, authors: [] });
      expect(
        buildCreatePayload("Patent", {
          title: "p",
          source: "l1",
          ownerActors: ["a1"],
        }),
      ).toMatchObject({
        owners: { actors: ["a1"], groups: [] },
        source: "l1",
      });
      expect(
        buildCreatePayload("Documentary", {
          title: "d",
          documentaryMedia: "m1",
          authorGroups: ["g1"],
        }),
      ).toMatchObject({
        media: "m1",
        authors: { actors: [], groups: ["g1"] },
        subjects: { actors: [], groups: [] },
      });
    });

    it("maps ScientificStudy authors/publisher", () => {
      expect(
        buildCreatePayload("ScientificStudy", {
          title: "s",
          url: "l1",
          studyAuthors: ["a1"],
          studyPublisher: "g1",
        }),
      ).toMatchObject({ url: "l1", authors: ["a1"], publisher: "g1" });
    });

    it("throws on missing required fields", () => {
      expect(() => buildCreatePayload("Death", {})).toThrow(/victim/);
      expect(() => buildCreatePayload("Book", { title: "b" })).toThrow(/pdf/);
    });
  });

  describe("buildEditPayload", () => {
    it("wraps only provided fields in Options", () => {
      const p = buildEditPayload("Death", { victim: "a2" }, {});
      expect(Object.keys(p)).toEqual(["victim"]);
      expect(O.getOrUndefined(p.victim as O.Option<string>)).toBe("a2");
    });

    it("merges nested Book media with the stored payload", () => {
      const p = buildEditPayload(
        "Book",
        { pdf: "new-pdf" },
        { media: { pdf: "old-pdf", audio: "keep-audio" } },
      );
      expect(O.getOrUndefined(p.media)).toEqual({
        pdf: "new-pdf",
        audio: "keep-audio",
      });
    });

    it("merges Patent owners and Documentary authors with the stored payload", () => {
      const patent = buildEditPayload(
        "Patent",
        { ownerGroups: ["g2"] },
        { owners: { actors: ["a1"], groups: ["g1"] } },
      );
      expect(O.getOrUndefined(patent.owners)).toEqual({
        actors: ["a1"],
        groups: ["g2"],
      });

      const doc = buildEditPayload(
        "Documentary",
        { subjectActors: ["a9"] },
        { subjects: { actors: [], groups: ["g1"] } },
      );
      expect(O.getOrUndefined(doc.subjects)).toEqual({
        actors: ["a9"],
        groups: ["g1"],
      });
    });

    it("returns an empty payload when nothing type-specific is given", () => {
      expect(buildEditPayload("Quote", {}, {})).toEqual({});
    });
  });
});
