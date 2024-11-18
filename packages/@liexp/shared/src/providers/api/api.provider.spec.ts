import { type AxiosInstance } from "axios";
import { describe, it, expect } from "vitest";
import { mock } from "vitest-mock-extended";
import { API } from "./api.provider.js";

describe("ApiProvider", () => {
  const axiosMock = mock<AxiosInstance>();
  it("should be defined", () => {
    const api = API(axiosMock);
    expect(api.Admin).toMatchObject({
      Get: expect.any(Function),
      Create: expect.any(Function),
      Edit: expect.any(Function),
      List: expect.any(Function),
      Custom: {
        BuildImage: expect.anything(),
        GetMediaStats: expect.anything(),
      },
    });

    expect(api.Actor).toMatchObject({
      Get: expect.any(Function),
      Create: expect.any(Function),
      Edit: expect.any(Function),
      List: expect.any(Function),
      Custom: {},
    });
  });
});
