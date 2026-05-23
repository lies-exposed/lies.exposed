import { describe, expect, it, vi } from "vitest";
import { GetQueueProvider } from "../queue.provider.js";

vi.mock("../../services/entity-repository.service.js", () => ({
  QueueRepository: {
    save: vi.fn().mockResolvedValue([{ id: "1", type: "test", status: "pending" }]),
    findOneOrFail: vi.fn().mockResolvedValue({ id: "1", type: "test", status: "pending" }),
    findOne: vi.fn().mockResolvedValue({ id: "1", type: "test", status: "pending" }),
    find: vi.fn().mockResolvedValue([{ id: "1", type: "test", status: "pending" }]),
    delete: vi.fn().mockResolvedValue({ affected: 1 }),
  },
}));

describe("GetQueueProvider", () => {
  it("returns a QueueProvider with all methods", () => {
    const provider = GetQueueProvider("test");
    expect(typeof provider.addJob).toBe("function");
    expect(typeof provider.getJob).toBe("function");
    expect(typeof provider.updateJob).toBe("function");
    expect(typeof provider.listJobs).toBe("function");
    expect(typeof provider.exists).toBe("function");
    expect(typeof provider.deleteJob).toBe("function");
  });

  it("addJob saves a job with timestamps", async () => {
    const provider = GetQueueProvider("test");
    const result = await provider.addJob({ id: "1", resource: "actors" })();
    expect(result._tag).toBe("Right");
  });

  it("getJob finds a job by resource and id", async () => {
    const provider = GetQueueProvider("test");
    const result = await provider.getJob("actors", "1")();
    expect(result._tag).toBe("Right");
  });

  it("listJobs finds all jobs", async () => {
    const provider = GetQueueProvider("test");
    const result = await provider.listJobs()();
    expect(result._tag).toBe("Right");
  });

  it("listJobs filters by resource", async () => {
    const provider = GetQueueProvider("test");
    const result = await provider.listJobs({ resource: "actors" })();
    expect(result._tag).toBe("Right");
  });

  it("exists returns true when job exists", async () => {
    const provider = GetQueueProvider("test");
    const result = await provider.exists({ id: "1", resource: "actors", type: "test" as any, status: "pending" as any })();
    expect(result._tag).toBe("Right");
    if (result._tag === "Right") {
      expect(result.right).toBe(true);
    }
  });

  it("exists returns false when job does not exist", async () => {
    const { QueueRepository } = await import("../../services/entity-repository.service.js");
    (QueueRepository.findOne as any).mockResolvedValue(null);

    const provider = GetQueueProvider("test");
    const result = await provider.exists({ id: "1", resource: "actors", type: "test" as any, status: "pending" as any })();
    expect(result._tag).toBe("Right");
    if (result._tag === "Right") {
      expect(result.right).toBe(false);
    }
  });

  it("updateJob updates job status", async () => {
    const provider = GetQueueProvider("test");
    const result = await provider.updateJob(
      { id: "1", resource: "actors", type: "test" as any, status: "pending" as any },
      "completed" as any,
    )();
    expect(result._tag).toBe("Right");
  });

  it("deleteJob deletes a job", async () => {
    const provider = GetQueueProvider("test");
    const result = await provider.deleteJob("actors", "1")();
    expect(result._tag).toBe("Right");
  });
});
