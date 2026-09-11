import { describe, expect, it, vi } from "vitest";

const mockIg = {
  state: { generateDevice: vi.fn() },
  account: {
    login: vi.fn().mockResolvedValue({ username: "testuser" }),
    twoFactorLogin: vi.fn().mockResolvedValue({ username: "testuser" }),
  },
  publish: {
    photo: vi.fn().mockResolvedValue({ id: "123" }),
    video: vi.fn().mockResolvedValue({ id: "123" }),
    album: vi.fn().mockResolvedValue({ id: "123" }),
  },
};

vi.mock("instagram-private-api", () => ({
  IgApiClient: vi.fn().mockImplementation(() => mockIg),
}));

const { IGProvider } = await import("../ig.provider.js");

describe("IGProvider", () => {
  const mockLogger = {
    debug: { log: vi.fn() },
    info: { log: vi.fn() },
    warn: { log: vi.fn() },
    error: { log: vi.fn() },
  };

  const mockCredentials = {
    username: "testuser",
    password: "testpass",
  };

  it("creates a provider with ig, login, postPhoto, postVideo, postAlbum", () => {
    const provider = IGProvider({
      logger: mockLogger as any,
      credentials: mockCredentials,
    });

    expect(provider).toHaveProperty("ig");
    expect(typeof provider.login).toBe("function");
    expect(typeof provider.postPhoto).toBe("function");
    expect(typeof provider.postVideo).toBe("function");
    expect(typeof provider.postAlbum).toBe("function");
  });

  it("login returns the logged in user", async () => {
    const provider = IGProvider({
      logger: mockLogger as any,
      credentials: mockCredentials,
    });

    const result = await provider.login(async () =>
      Promise.resolve({ code: "123456" }),
    )();
    expect(result._tag).toBe("Right");
  });

  it("login returns cached user on second call", async () => {
    const provider = IGProvider({
      logger: mockLogger as any,
      credentials: mockCredentials,
    });

    await provider.login(async () => Promise.resolve({ code: "123456" }))();
    await provider.login(async () => Promise.resolve({ code: "123456" }))();

    expect(mockIg.account.login).toHaveBeenCalledTimes(1);
  });

  it("postPhoto posts an image", async () => {
    const provider = IGProvider({
      logger: mockLogger as any,
      credentials: mockCredentials,
    });

    const result = await provider.postPhoto(Buffer.from("image"), "caption")();
    expect(result._tag).toBe("Right");
    expect(mockIg.publish.photo).toHaveBeenCalledWith({
      file: Buffer.from("image"),
      caption: "caption",
    });
  });

  it("postVideo posts a video", async () => {
    const provider = IGProvider({
      logger: mockLogger as any,
      credentials: mockCredentials,
    });

    const result = await provider.postVideo({
      video: Buffer.from("video"),
      caption: "video caption",
    })();
    expect(result._tag).toBe("Right");
    expect(mockIg.publish.video).toHaveBeenCalled();
  });

  it("postAlbum posts an album", async () => {
    const provider = IGProvider({
      logger: mockLogger as any,
      credentials: mockCredentials,
    });

    const result = await provider.postAlbum({
      photos: [Buffer.from("photo1")],
      caption: "album caption",
    })();
    expect(result._tag).toBe("Right");
    expect(mockIg.publish.album).toHaveBeenCalled();
  });

  it("login handles two factor authentication", async () => {
    const { IgLoginTwoFactorRequiredError } =
      await import("instagram-private-api");

    const mockTwoFactorError = {
      response: {
        body: {
          two_factor_info: {
            username: "testuser",
            totp_two_factor_on: false,
            two_factor_identifier: "identifier",
          },
        },
      },
    } as any;

    const mockIg2 = {
      state: { generateDevice: vi.fn() },
      account: {
        login: vi.fn().mockRejectedValue(mockTwoFactorError),
        twoFactorLogin: vi.fn().mockResolvedValue({ username: "testuser" }),
      },
      publish: {
        photo: vi.fn().mockResolvedValue({ id: "123" }),
        video: vi.fn().mockResolvedValue({ id: "123" }),
        album: vi.fn().mockResolvedValue({ id: "123" }),
      },
    };

    vi.mock("instagram-private-api", () => ({
      IgApiClient: vi.fn().mockImplementation(() => mockIg2),
      IgLoginTwoFactorRequiredError,
    }));

    const provider = IGProvider({
      logger: mockLogger as any,
      credentials: mockCredentials,
    });

    const result = await provider.login(async () =>
      Promise.resolve({ code: "123456" }),
    )();
    expect(result._tag).toBe("Right");
    expect(mockIg2.account.twoFactorLogin).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "testuser",
        verificationCode: "123456",
        verificationMethod: "1",
      }),
    );
  });
});
