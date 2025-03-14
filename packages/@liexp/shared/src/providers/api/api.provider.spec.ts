import { type AxiosInstance } from "axios";
import { describe, it, expect } from "vitest";
import { mock } from "vitest-mock-extended";
import { API } from "./api.provider.js";

describe("ApiProvider", () => {
  const axiosMock = mock<AxiosInstance>();
  it("should be defined", () => {
    const api = API(axiosMock);
    expect(api.Admin).toMatchObject({
      Get: expecSchema.Any(Function),
      Create: expecSchema.Any(Function),
      Edit: expecSchema.Any(Function),
      List: expecSchema.Any(Function),
      Custom: {
        BuildImage: expecSchema.Anything(),
        GetMediaStats: expecSchema.Anything(),
      },
    });

    expect(api.Actor).toMatchObject({
      Get: expecSchema.Any(Function),
      Create: expecSchema.Any(Function),
      Edit: expecSchema.Any(Function),
      List: expecSchema.Any(Function),
      Custom: {},
    });
  });
});
