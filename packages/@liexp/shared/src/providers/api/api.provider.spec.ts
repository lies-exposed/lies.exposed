import { API } from "./api.provider";

describe("ApiProvider", () => {
  it("should be defined", () => {
    const api = API({ baseURL: "http://localhost:3000" });
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
