import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type DatabaseContext } from "../../context/db.context.js";
import { LinkEntity } from "../../entities/Link.entity.js";
import { mockedContext } from "../../test/context.js";
import { validateStoryPublish } from "./validateStoryPublish.flow.js";
import type { UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import * as Link from "@liexp/io/lib/http/Link.js";

type ValidateStoryPublishContext = DatabaseContext;

describe(validateStoryPublish.name, () => {
  const appTest = {
    ctx: mockedContext<ValidateStoryPublishContext>({
      db: mock(),
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return right(undefined) immediately when draft is true", async () => {
    const linkIds: UUID[] = [uuid(), uuid()];

    const result = await pipe(
      validateStoryPublish(true, linkIds)(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.find).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("should return right(undefined) immediately when linkIds is empty", async () => {
    const result = await pipe(
      validateStoryPublish(false, [])(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.find).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });

  it("should return right(undefined) when no linked links are in DRAFT status", async () => {
    const linkIds: UUID[] = [uuid(), uuid()];

    appTest.ctx.db.find.mockReturnValueOnce(fp.TE.right([]));

    const result = await pipe(
      validateStoryPublish(false, linkIds)(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.find).toHaveBeenCalledWith(
      LinkEntity,
      expect.objectContaining({
        where: expect.objectContaining({
          status: Link.DRAFT.literals[0],
        }),
      }),
    );
    expect(result).toBeUndefined();
  });

  it("should return left(IOError) with 400 status when draft links are found", async () => {
    const linkIds: UUID[] = [uuid(), uuid()];

    const draftLink1 = new LinkEntity();
    draftLink1.id = linkIds[0];
    draftLink1.url = "https://example.com/draft-1" as any;

    const draftLink2 = new LinkEntity();
    draftLink2.id = linkIds[1];
    draftLink2.url = "https://example.com/draft-2" as any;

    appTest.ctx.db.find.mockReturnValueOnce(
      fp.TE.right([draftLink1, draftLink2]),
    );

    const either = await pipe(
      validateStoryPublish(false, linkIds)(appTest.ctx),
    )();

    expect(fp.E.isLeft(either)).toBe(true);
    if (fp.E.isLeft(either)) {
      expect(either.left.details.status).toBe("400");
      expect(either.left.details.kind).toBe("ClientError");
      expect(either.left.message).toContain(
        "Cannot publish story: 2 related link(s) are still in DRAFT status",
      );
      expect(either.left.details.meta).toEqual([
        draftLink1.url,
        draftLink2.url,
      ]);
    }
  });

  it("should return left(IOError) with a single offending link URL in meta", async () => {
    const linkIds: UUID[] = [uuid()];

    const draftLink = new LinkEntity();
    draftLink.id = linkIds[0];
    draftLink.url = "https://example.com/single-draft" as any;

    appTest.ctx.db.find.mockReturnValueOnce(fp.TE.right([draftLink]));

    const either = await pipe(
      validateStoryPublish(false, linkIds)(appTest.ctx),
    )();

    expect(fp.E.isLeft(either)).toBe(true);
    if (fp.E.isLeft(either)) {
      expect(either.left.details.status).toBe("400");
      expect(either.left.message).toContain(
        "Cannot publish story: 1 related link(s) are still in DRAFT status",
      );
      expect(either.left.details.meta).toEqual([draftLink.url]);
    }
  });

  it("should propagate db.find errors", async () => {
    const { DBError } = await import("../../providers/orm/database.provider.js");
    const linkIds: UUID[] = [uuid()];
    const dbError = new DBError("DB connection failed", {
      kind: "ServerError",
      status: "500",
      meta: [],
    });

    appTest.ctx.db.find.mockReturnValueOnce(fp.TE.left(dbError));

    const either = await pipe(
      validateStoryPublish(false, linkIds)(appTest.ctx),
    )();

    expect(fp.E.isLeft(either)).toBe(true);
    if (fp.E.isLeft(either)) {
      expect(either.left.message).toBe("DB connection failed");
    }
  });

  it("should query using In() with the provided linkIds and DRAFT status", async () => {
    const linkId1 = uuid();
    const linkId2 = uuid();
    const linkIds: UUID[] = [linkId1, linkId2];

    appTest.ctx.db.find.mockReturnValueOnce(fp.TE.right([]));

    await pipe(validateStoryPublish(false, linkIds)(appTest.ctx), throwTE);

    expect(appTest.ctx.db.find).toHaveBeenCalledWith(
      LinkEntity,
      expect.objectContaining({
        where: expect.objectContaining({
          status: Link.DRAFT.literals[0],
        }),
        select: ["id", "url"],
      }),
    );
  });
});
