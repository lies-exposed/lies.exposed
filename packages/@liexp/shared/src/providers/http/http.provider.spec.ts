import * as axiosModule from "axios";
import {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import { type ParseError } from "effect/ParseResult";
import { describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { throwTE } from "../../utils/fp.utils.js";
import {
  HTTPProvider,
  HTTPError,
  toHTTPError,
  fromValidationErrors,
  liftFetch,
} from "./http.provider.js";

const requestConfig = (): InternalAxiosRequestConfig => ({
  url: "/resource/1",
  headers: new AxiosHeaders(),
});

const responseFixture = <T>(data: T, status = 200): AxiosResponse<T> => ({
  data,
  status,
  statusText: "OK",
  headers: new AxiosHeaders(),
  config: requestConfig(),
});

const axiosErrorFixture = (message: string, status?: number): AxiosError => {
  const error = new AxiosError(message, undefined, requestConfig());
  if (status !== undefined) {
    error.response = responseFixture(undefined, status);
  }
  return error;
};

const parseErrorFixture = (): ParseError => {
  const result = Schema.decodeUnknownEither(Schema.String)(123, {
    errors: "all",
  });
  if (result._tag === "Right") {
    throw new Error("Expected a decode failure");
  }
  return result.left;
};

// Mock axios
vi.mock("axios", async (importOriginal) => {
  const actual = await importOriginal<typeof axiosModule>();
  return { ...actual, isAxiosError: vi.fn((e) => actual.isAxiosError(e)) };
});

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

  it("should get with config", async () => {
    const config = { headers: { "X-Custom": "value" } };
    axiosMock.get.mockResolvedValue({ data: { id: "1" } });
    const result = await pipe(httpProvider.get("/resource/1", config), throwTE);
    expect(axiosMock.get).toHaveBeenCalledWith("/resource/1", config);
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

  it("should post with config", async () => {
    const config = { headers: { "Content-Type": "application/json" } };
    axiosMock.post.mockResolvedValue({ data: { id: "1" } });
    const result = await pipe(
      httpProvider.post("/resource", { foo: "bar" }, config),
      throwTE,
    );
    expect(axiosMock.post).toHaveBeenCalledWith(
      "/resource",
      { foo: "bar" },
      config,
    );
    expect(result).toMatchObject({ id: "1" });
  });

  it("should put a resource", async () => {
    axiosMock.put.mockResolvedValue({ data: { id: "1", updated: true } });
    const result = await pipe(
      httpProvider.put("/resource/1", { foo: "bar" }),
      throwTE,
    );
    expect(axiosMock.put).toHaveBeenCalledWith(
      "/resource/1",
      { foo: "bar" },
      undefined,
    );
    expect(result).toMatchObject({ id: "1", updated: true });
  });

  it("should put with config", async () => {
    const config = { headers: { "Content-Type": "application/json" } };
    axiosMock.put.mockResolvedValue({ data: { id: "1" } });
    const result = await pipe(
      httpProvider.put("/resource/1", { foo: "bar" }, config),
      throwTE,
    );
    expect(axiosMock.put).toHaveBeenCalledWith(
      "/resource/1",
      { foo: "bar" },
      config,
    );
    expect(result).toMatchObject({ id: "1" });
  });

  it("should handle get error", async () => {
    const axiosError = axiosErrorFixture("Network Error", 404);
    axiosMock.get.mockRejectedValue(axiosError);
    await expect(
      pipe(httpProvider.get("/resource/1"), throwTE),
    ).rejects.toBeInstanceOf(HTTPError);
  });

  it("should handle post error", async () => {
    const axiosError = axiosErrorFixture("Server Error", 500);
    axiosMock.post.mockRejectedValue(axiosError);
    await expect(
      pipe(httpProvider.post("/resource"), throwTE),
    ).rejects.toBeInstanceOf(HTTPError);
  });

  it("should handle put error", async () => {
    const axiosError = axiosErrorFixture("Not Found", 404);
    axiosMock.put.mockRejectedValue(axiosError);
    await expect(
      pipe(httpProvider.put("/resource/1"), throwTE),
    ).rejects.toBeInstanceOf(HTTPError);
  });
});

describe("toHTTPError", () => {
  it("handles axios error with response", () => {
    const axiosError = axiosErrorFixture("Network Error", 404);
    axiosError.stack = "Error: Network Error\n    at ...";
    axiosError.cause = new Error("timeout");

    const error = toHTTPError(axiosError);
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.message).toBe("Network Error");
  });

  it("handles axios error without response (defaults to 500)", () => {
    const axiosError = axiosErrorFixture("Network Error");
    axiosError.stack = "Error: Network Error\n    at ...";

    const error = toHTTPError(axiosError);
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.message).toBe("Network Error");
  });

  it("handles general Error", () => {
    const error = toHTTPError(new Error("Something went wrong"));
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.message).toBe("Something went wrong");
  });

  it("handles Error with undefined stack", () => {
    const err = new Error("No stack");
    err.stack = undefined;
    const error = toHTTPError(err);
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.message).toBe("No stack");
  });

  it("handles unknown error type", () => {
    const error = toHTTPError("string error");
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.message).toBe("Unknown error");
  });

  it("handles number error type", () => {
    const error = toHTTPError(42);
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.message).toBe("Unknown error");
  });

  it("handles object error type", () => {
    const error = toHTTPError({ code: "ERR", message: "fail" });
    expect(error).toBeInstanceOf(HTTPError);
    expect(error.message).toBe("Unknown error");
  });
});

describe("fromValidationErrors", () => {
  it("maps ParseError to HTTPError", () => {
    const result = fromValidationErrors(E.left(parseErrorFixture()));
    expect(E.isLeft(result)).toBe(true);
    if (E.isLeft(result)) {
      expect(result.left.message).toBe("Validation failed.");
    }
  });

  it("passes Right through unchanged", () => {
    const result = fromValidationErrors(E.right({ data: "value" }));
    expect(E.isRight(result)).toBe(true);
    if (E.isRight(result)) {
      expect(result.right).toEqual({ data: "value" });
    }
  });
});

describe("liftFetch", () => {
  it("lifts successful fetch with decode", async () => {
    const lp = vi.fn(() =>
      Promise.resolve(responseFixture({ id: "1", name: "test" })),
    );
    const decode = vi.fn((d: { id: string; name: string }) =>
      E.right<ParseError, { id: string; name: string }>(d),
    );

    const result = await pipe(liftFetch(lp, decode), throwTE);
    expect(result).toEqual({ id: "1", name: "test" });
    expect(lp).toHaveBeenCalled();
    expect(decode).toHaveBeenCalledWith({ id: "1", name: "test" });
  });

  it("lifts successful fetch with decode that transforms", async () => {
    const lp = vi.fn(() => Promise.resolve(responseFixture({ name: "test" })));
    const decode = vi.fn((d: { name: string }) =>
      E.right<ParseError, { id: string; name: string }>({ id: "1", ...d }),
    );

    const result = await pipe(liftFetch(lp, decode), throwTE);
    expect(result).toEqual({ id: "1", name: "test" });
  });

  it("handles axios error in liftFetch", async () => {
    const lp = vi.fn((): Promise<AxiosResponse<unknown>> =>
      Promise.reject(new Error("Network Error")),
    );
    const decode = vi.fn((d: unknown) => E.right<ParseError, unknown>(d));

    await expect(pipe(liftFetch(lp, decode), throwTE)).rejects.toBeInstanceOf(
      HTTPError,
    );
  });

  it("handles decode failure in liftFetch", async () => {
    const lp = vi.fn(() => Promise.resolve(responseFixture({ invalid: true })));
    const decode = vi.fn((d: { invalid: boolean }) =>
      E.left<ParseError, unknown>(parseErrorFixture()),
    );

    await expect(pipe(liftFetch(lp, decode), throwTE)).rejects.toBeInstanceOf(
      HTTPError,
    );
  });

  it("handles non-axios error in liftFetch", async () => {
    const lp = vi.fn((): Promise<AxiosResponse<unknown>> =>
      Promise.reject(new Error("Random error")),
    );
    const decode = vi.fn((d: unknown) => E.right<ParseError, unknown>(d));

    await expect(pipe(liftFetch(lp, decode), throwTE)).rejects.toBeInstanceOf(
      HTTPError,
    );
  });
});

describe("HTTPProvider factory", () => {
  it("creates provider with get, put, post methods", () => {
    const client = mock<AxiosInstance>();
    const provider = HTTPProvider(client);
    expect(typeof provider.get).toBe("function");
    expect(typeof provider.put).toBe("function");
    expect(typeof provider.post).toBe("function");
  });
});
