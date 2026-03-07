import { beforeEach, describe, expect, test, vi } from "vitest";
import { createCliExecutorTool } from "../cli-executor.tool.js";

// vi.hoisted ensures mockExecAsync is available before vi.mock hoisting runs
const { mockExecAsync } = vi.hoisted(() => ({
  mockExecAsync: vi.fn(),
}));

vi.mock("node:child_process", () => ({
  execFile: vi.fn(),
}));

vi.mock("node:util", () => ({
  promisify: () => mockExecAsync,
}));

const BIN_PATH = "/app/build/cli/cli.js";

describe("createCliExecutorTool", () => {
  let tool: ReturnType<typeof createCliExecutorTool>;

  beforeEach(() => {
    vi.clearAllMocks();
    tool = createCliExecutorTool(BIN_PATH);
  });

  test("tool is named find_platform_data", () => {
    expect(tool.name).toBe("find_platform_data");
  });

  test("tool has a non-empty description", () => {
    expect(typeof tool.description).toBe("string");
    expect(tool.description.length).toBeGreaterThan(0);
  });

  test("returns stdout when exec succeeds", async () => {
    const json = JSON.stringify({ data: [], total: 0 });
    mockExecAsync.mockResolvedValueOnce({ stdout: json, stderr: "" });

    const result = await tool.invoke({ command: "actor list --end=10" });

    expect(mockExecAsync).toHaveBeenCalledWith(
      "node",
      [BIN_PATH, "actor", "list", "--end=10"],
      { timeout: 30_000 },
    );
    expect(result).toBe(json);
  });

  test("returns stderr when stdout is empty", async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: "", stderr: "some warning" });

    const result = await tool.invoke({ command: "actor list" });

    expect(result).toBe("some warning");
  });

  test("returns '(no output)' when both stdout and stderr are empty", async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: "", stderr: "" });

    const result = await tool.invoke({ command: "actor list" });

    expect(result).toBe("(no output)");
  });

  test("returns error string with exit code when exec throws", async () => {
    const err: any = new Error("Command failed");
    err.code = 1;
    err.stderr = "actor not found";
    mockExecAsync.mockRejectedValueOnce(err);

    const result = await tool.invoke({ command: "actor get --id=bad-id" });

    expect(result).toContain("ERROR (exit 1)");
    expect(result).toContain("actor not found");
  });

  test("falls back to exit code 1 when err.code is undefined", async () => {
    const err: any = new Error("Unknown failure");
    mockExecAsync.mockRejectedValueOnce(err);

    const result = await tool.invoke({ command: "event list" });

    expect(result).toContain("ERROR (exit 1)");
  });

  test("omits stderr section when err.stderr is empty", async () => {
    const err: any = new Error("Timeout");
    err.code = 124;
    err.stderr = "";
    mockExecAsync.mockRejectedValueOnce(err);

    const result = await tool.invoke({ command: "media list" });

    expect(result).toContain("ERROR (exit 124)");
    expect(result).not.toContain("stderr:");
  });

  test("passes the full command string to exec", async () => {
    mockExecAsync.mockResolvedValueOnce({ stdout: "{}", stderr: "" });

    await tool.invoke({
      command: "event list --query=vaccine --start=0 --end=5",
    });

    expect(mockExecAsync).toHaveBeenCalledWith(
      "node",
      [BIN_PATH, "event", "list", "--query=vaccine", "--start=0", "--end=5"],
      { timeout: 30_000 },
    );
  });
});
