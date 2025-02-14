import type { AxiosInstance } from "axios";
import { pipe } from "fp-ts/lib/function.js";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { throwTE } from "../../utils/task.utils.js";
import { HTTPProvider } from "./http.provider.js";

describe("HttpProvider", () => {
  const axiosMock = mock<AxiosInstance>();
  const httpProvider = HTTPProvider(axiosMock);
  it("should be defined", () => {
    expect(httpProvider).toBeDefined();
  });

  it("should get a resource", async () => {
    axiosMock.get.mockResolvedValue({ data: { id: "1" } });
    const result = await pipe(httpProvider.get("/resource/1"), throwTE);
    expect(axiosMock.get).toHaveBeenCalledWith("/resource/1", undefined);
    expect(result).toMatchObject({ id: "1" });
  });

  it("should post a resource", async () => {
    axiosMock.post.mockResolvedValue({ data: { id: "1", foo: "bar" } });
    const result = await pipe(
      httpProvider.post("/resource", { foo: "bar" }),
      throwTE,
    );
    expect(axiosMock.post).toHaveBeenCalledWith(
      "/resource",
      { foo: "bar" },
      undefined,
    );
    expect(result).toMatchObject({ id: "1", foo: "bar" });
  });
});
