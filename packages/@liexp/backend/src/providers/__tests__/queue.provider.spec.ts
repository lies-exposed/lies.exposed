import { describe, expect, it, vi } from "vitest";
import type { DatabaseContext } from "../../context/db.context.js";
import { QueueIO } from "../../io/queue.io.js";
import { QueueRepository } from "../../services/entity-repository.service.js";
import { GetQueueProvider } from "../queue.provider.js";

// Mock modules using the pattern from existing tests in this codebase
vi.mock("../../io/queue.io.js", () => ({
  QueueIO: {
    decodeSingle: vi.fn(),
    decodeMany: vi.fn(),
  },
}));

vi.mock("../../services/entity-repository.service.js", () => ({
  QueueRepository: {
    save: vi.fn(),
    findOneOrFail: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("GetQueueProvider", () => {
  const mockQueueEntity = {
    id: "1",
    type: "openai-summarize" as const,
    status: "pending" as const,
    resource: "actors" as const,
    data: { text: "test" },
    result: null,
    prompt: null,
    error: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  };

  // ReaderTaskEither<C, E, A> = C => () => Promise<Either<E, A>>
  // The mock returns a function that takes context and returns a TaskEither
  const right =
    <A>(value: A) =>
    () =>
    () =>
      Promise.resolve({ _tag: "Right" as const, right: value });

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock return values
    vi.mocked(QueueIO.decodeSingle).mockReturnValue({
      _tag: "Right" as const,
      right: mockQueueEntity,
    });
    vi.mocked(QueueIO.decodeMany).mockReturnValue({
      _tag: "Right" as const,
      right: [mockQueueEntity],
    });
    vi.mocked(QueueRepository.save).mockReturnValue(right([mockQueueEntity]));
    vi.mocked(QueueRepository.findOneOrFail).mockReturnValue(
      right(mockQueueEntity),
    );
    vi.mocked(QueueRepository.findOne).mockReturnValue(
      right({ _tag: "Some" as const, value: mockQueueEntity }),
    );
    vi.mocked(QueueRepository.find).mockReturnValue(right([mockQueueEntity]));
    vi.mocked(QueueRepository.delete).mockReturnValue(
      right({ affected: 1, raw: [], generatedId: "" }),
    );
  });

  it("returns a QueueProvider with all methods", () => {
    const provider = GetQueueProvider.queue("test");
    expect(typeof provider.addJob).toBe("function");
    expect(typeof provider.getJob).toBe("function");
    expect(typeof provider.updateJob).toBe("function");
    expect(typeof provider.listJobs).toBe("function");
    expect(typeof provider.exists).toBe("function");
    expect(typeof provider.deleteJob).toBe("function");
  });

  it("addJob saves a job with timestamps", async () => {
    const provider = GetQueueProvider.queue("test");
    const result = await provider.addJob({
      id: "1",
      resource: "actors",
      type: "openai-summarize",
      data: { text: "test" },
    })({} as Partial<DatabaseContext>)();
    expect(result._tag).toBe("Right");
  });

  it("getJob finds a job by resource and id", async () => {
    const provider = GetQueueProvider.queue("test");
    const result = await provider.getJob(
      "actors",
      "1",
    )({} as Partial<DatabaseContext>)();
    expect(result._tag).toBe("Right");
  });

  it("listJobs finds all jobs", async () => {
    const provider = GetQueueProvider.queue("test");
    const result = await provider.listJobs()({} as Partial<DatabaseContext>)();
    expect(result._tag).toBe("Right");
  });

  it("listJobs filters by resource", async () => {
    const provider = GetQueueProvider.queue("test");
    const result = await provider.listJobs({ resource: "actors" })(
      {} as Partial<DatabaseContext>,
    )();
    expect(result._tag).toBe("Right");
  });

  it("exists returns true when job exists", async () => {
    const provider = GetQueueProvider.queue("test");
    const result = await provider.exists({
      id: "1",
      resource: "actors",
      type: "openai-summarize",
      status: "pending",
    })({} as Partial<DatabaseContext>)();
    expect(result._tag).toBe("Right");
    if (result._tag === "Right") {
      expect(result.right).toBe(true);
    }
  });

  it("exists returns false when job does not exist", async () => {
    vi.mocked(QueueRepository.findOne).mockReturnValue(
      right({ _tag: "None" as const }),
    );

    const provider = GetQueueProvider.queue("test");
    const result = await provider.exists({
      id: "1",
      resource: "actors",
      type: "openai-summarize",
      status: "pending",
    })({} as Partial<DatabaseContext>)();
    expect(result._tag).toBe("Right");
    if (result._tag === "Right") {
      expect(result.right).toBe(false);
    }
  });

  it("updateJob updates job status", async () => {
    const provider = GetQueueProvider.queue("test");
    const result = await provider.updateJob(
      {
        id: "1",
        resource: "actors",
        type: "openai-summarize",
        status: "pending",
      },
      "completed",
    )({} as Partial<DatabaseContext>)();
    expect(result._tag).toBe("Right");
  });

  it("deleteJob deletes a job", async () => {
    const provider = GetQueueProvider.queue("test");
    const result = await provider.deleteJob(
      "actors",
      "1",
    )({} as Partial<DatabaseContext>)();
    expect(result._tag).toBe("Right");
  });
});
