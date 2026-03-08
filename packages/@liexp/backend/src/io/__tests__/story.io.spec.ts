import { StoryArb } from "@liexp/test/lib/arbitrary/Story.arbitrary.js";
import fc from "fast-check";
import * as E from "fp-ts/lib/Either.js";
import { describe, expect, it } from "vitest";
import { StoryIO } from "../story.io.js";

const toStoryEntity = (story: any) => ({
  ...story,
  date: story.date ? new Date(story.date) : null,
  createdAt: new Date(story.createdAt),
  updatedAt: new Date(story.updatedAt),
  deletedAt: story.deletedAt ? new Date(story.deletedAt) : null,
  draft: false,
  featuredImage: null,
  creator: null,
  body: story.body ?? "",
  body2: null,
  keywords: [],
  links: [],
  media: [],
  actors: [],
  groups: [],
  events: [],
});

describe("StoryIO", () => {
  describe("decodeSingle", () => {
    it("should decode a story entity to Story HTTP type", () => {
      const story = fc.sample(StoryArb, 1)[0];
      const entity = toStoryEntity(story);
      const result = StoryIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should preserve story id in decoded result", () => {
      const story = fc.sample(StoryArb, 1)[0];
      const entity = toStoryEntity(story);
      const result = StoryIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.id).toBe(story.id);
      }
    });

    it("should decode story with null date", () => {
      const story = fc.sample(StoryArb, 1)[0];
      const entity = {
        ...toStoryEntity(story),
        date: null,
      };
      const result = StoryIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode story with null featuredImage", () => {
      const story = fc.sample(StoryArb, 1)[0];
      const entity = {
        ...toStoryEntity(story),
        featuredImage: null,
      };
      const result = StoryIO.decodeSingle(entity);
      expect(E.isRight(result)).toBe(true);
    });

    it("should decode multiple stories via decodeMany", () => {
      const stories = fc.sample(StoryArb, 3).map(toStoryEntity);
      const result = StoryIO.decodeMany(stories);
      expect(E.isRight(result)).toBe(true);
      if (E.isRight(result)) {
        expect(result.right.length).toBe(3);
      }
    });
  });

  describe("encodeSingle", () => {
    it("should return Left since encode is not implemented", () => {
      const story = fc.sample(StoryArb, 1)[0];
      const entity = toStoryEntity(story);
      const result = StoryIO.encodeSingle(entity as never);
      expect(E.isLeft(result)).toBe(true);
    });
  });
});
