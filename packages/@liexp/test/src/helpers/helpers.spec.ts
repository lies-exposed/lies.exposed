import { describe, expect, it } from "vitest";
import { mockOf } from "./mockOf.js";
import { partial } from "./partial.js";

describe("partial", () => {
  it("returns an object with all properties as undefined", () => {
    interface User {
      id: string;
      name: string;
      email: string;
    }
    const user = partial<User>();
    expect(user.id).toBe(undefined);
    expect(user.name).toBe(undefined);
    expect(user.email).toBe(undefined);
  });

  it("has all property keys via has", () => {
    interface User {
      id: string;
      name: string;
    }
    const user = partial<User>();
    expect("id" in user).toBe(true);
    expect("name" in user).toBe(true);
  });
});

describe("mockOf", () => {
  it("returns a function for any property access", () => {
    interface Client {
      fetch: () => Promise<string>;
      config: { timeout: number };
    }
    const client = mockOf<Client>();
    expect(typeof client.fetch).toBe("function");
    expect(client.fetch()).toBe(undefined);
  });

  it("all property accesses return functions", () => {
    interface Service {
      a: () => void;
      b: () => void;
      c: () => void;
    }
    const service = mockOf<Service>();
    expect(typeof service.a).toBe("function");
    expect(typeof service.b).toBe("function");
    expect(typeof service.c).toBe("function");
  });

  it("has all property keys via has", () => {
    interface Service {
      a: () => void;
      b: () => void;
    }
    const service = mockOf<Service>();
    expect("a" in service).toBe(true);
    expect("b" in service).toBe(true);
  });
});
