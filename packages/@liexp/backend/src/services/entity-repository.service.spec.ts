import { describe, expect, it } from "vitest";
import {
  ActorRepository,
  AreaRepository,
  EventRepository,
  GroupRepository,
  KeywordRepository,
  LinkRepository,
  MediaRepository,
  NationRepository,
  QueueRepository,
  StoryRepository,
  UserRepository,
} from "./entity-repository.service.js";

describe("entity-repository.service", () => {
  describe("repositories", () => {
    it("should have findOne method", () => {
      expect(typeof ActorRepository.findOne).toBe("function");
      expect(typeof EventRepository.findOne).toBe("function");
      expect(typeof MediaRepository.findOne).toBe("function");
    });

    it("should have findOneOrFail method", () => {
      expect(typeof ActorRepository.findOneOrFail).toBe("function");
      expect(typeof EventRepository.findOneOrFail).toBe("function");
    });

    it("should have find method", () => {
      expect(typeof ActorRepository.find).toBe("function");
      expect(typeof GroupRepository.find).toBe("function");
    });

    it("should have save method", () => {
      expect(typeof ActorRepository.save).toBe("function");
      expect(typeof LinkRepository.save).toBe("function");
    });

    it("should have delete method", () => {
      expect(typeof ActorRepository.delete).toBe("function");
      expect(typeof KeywordRepository.delete).toBe("function");
    });

    it("should have softDelete method", () => {
      expect(typeof ActorRepository.softDelete).toBe("function");
      expect(typeof EventRepository.softDelete).toBe("function");
    });
  });

  describe("all entities have repositories", () => {
    it("should export ActorRepository", () => {
      expect(ActorRepository).toBeDefined();
    });

    it("should export AreaRepository", () => {
      expect(AreaRepository).toBeDefined();
    });

    it("should export EventRepository", () => {
      expect(EventRepository).toBeDefined();
    });

    it("should export GroupRepository", () => {
      expect(GroupRepository).toBeDefined();
    });

    it("should export KeywordRepository", () => {
      expect(KeywordRepository).toBeDefined();
    });

    it("should export LinkRepository", () => {
      expect(LinkRepository).toBeDefined();
    });

    it("should export MediaRepository", () => {
      expect(MediaRepository).toBeDefined();
    });

    it("should export NationRepository", () => {
      expect(NationRepository).toBeDefined();
    });

    it("should export QueueRepository", () => {
      expect(QueueRepository).toBeDefined();
    });

    it("should export StoryRepository", () => {
      expect(StoryRepository).toBeDefined();
    });

    it("should export UserRepository", () => {
      expect(UserRepository).toBeDefined();
    });
  });
});
