import { fc } from "@econnessione/core/tests";
import { URLArb } from "../../../../tests/arbitrary/URL.arbitrary";
import { URL } from "../URL";

describe("URL codec", () => {
  test("Should decode given input", () => {
    const url1 = "http://econnessione.org:4002/#/links/create";
    expect(URL.decode(url1)._tag).toBe("Right");

    const url2 = "http://econnessione.org:4002/#/links/create";
    expect(URL.decode(url2)._tag).toBe("Right");

    const url3 = "http://econnessione.org:4002/#/links/create";
    expect(URL.decode(url3)._tag).toBe("Right");

    const url4 = "http://econnessione.org:4002/#/links/create";
    expect(URL.decode(url4)._tag).toBe("Right");

    fc.sample(URLArb, 100).forEach((url) => {
      expect(URL.decode(url)._tag).toBe("Right");
    });
  });
});
