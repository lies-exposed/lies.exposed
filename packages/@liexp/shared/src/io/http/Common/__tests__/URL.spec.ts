import { URL } from "../URL";

describe("URL codec", () => {
  test("Should decode given input", () => {
    const url1 = "http://lies.exposed:4002/#/links/create";
    expect(URL.decode(url1)._tag).toBe("Right");

    const url2 = "http://lies.exposed:4002/#/links/create";
    expect(URL.decode(url2)._tag).toBe("Right");

    const url3 = "http://lies.exposed:4002/#/links/create";
    expect(URL.decode(url3)._tag).toBe("Right");

    const url4 = "http://lies.exposed:4002/#/links/create";
    expect(URL.decode(url4)._tag).toBe("Right");

    [].forEach((url) => {
      expect(URL.decode(url)._tag).toBe("Right");
    });
  });
});
