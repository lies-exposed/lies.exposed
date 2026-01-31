import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/io/lib/http/Common/UUID.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";
import { type ENVContext } from "../../context/env.context.js";
import { type LoggerContext } from "../../context/logger.context.js";
import { type SpaceContext } from "../../context/space.context.js";
import { MediaEntity } from "../../entities/Media.entity.js";
import { mockedContext } from "../../test/context.js";
import { deleteFromSpace } from "./deleteFromSpace.flow.js";

type DeleteFromSpaceContext = LoggerContext & SpaceContext & ENVContext;

describe(deleteFromSpace.name, () => {
  const SPACE_BUCKET = "test-bucket";

  const appTest = {
    ctx: {
      ...mockedContext<DeleteFromSpaceContext>({
        s3: mock(),
      }),
      env: {
        SPACE_BUCKET,
      } as any,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete media location from space when in bucket", async () => {
    const media = new MediaEntity();
    media.id = uuid();
    media.location = `https://${SPACE_BUCKET}.s3.amazonaws.com/media/image.jpg`;
    media.thumbnail = null;

    appTest.ctx.s3.deleteObject.mockReturnValue(fp.TE.right({}));

    const result = await pipe(deleteFromSpace(media)(appTest.ctx), throwTE);

    expect(result.id).toBe(media.id);
  });

  it("should delete both location and thumbnail when both are in bucket", async () => {
    const media = new MediaEntity();
    media.id = uuid();
    media.location = `https://${SPACE_BUCKET}.s3.amazonaws.com/media/image.jpg`;
    media.thumbnail = `https://${SPACE_BUCKET}.s3.amazonaws.com/media/thumb.jpg`;

    appTest.ctx.s3.deleteObject.mockReturnValue(fp.TE.right({}));

    const result = await pipe(deleteFromSpace(media)(appTest.ctx), throwTE);

    expect(appTest.ctx.s3.deleteObject).toHaveBeenCalled();
    expect(result.id).toBe(media.id);
  });

  it("should skip deletion when location is not in bucket", async () => {
    const media = new MediaEntity();
    media.id = uuid();
    media.location = "https://external-site.com/image.jpg";
    media.thumbnail = null;

    const result = await pipe(deleteFromSpace(media)(appTest.ctx), throwTE);

    expect(result.id).toBe(media.id);
  });

  it("should return the original media entity after deletion", async () => {
    const media = new MediaEntity();
    media.id = uuid();
    media.label = "Test Media";
    media.location = `https://${SPACE_BUCKET}.s3.amazonaws.com/media/test.jpg`;
    media.thumbnail = null;

    appTest.ctx.s3.deleteObject.mockReturnValue(fp.TE.right({}));

    const result = await pipe(deleteFromSpace(media)(appTest.ctx), throwTE);

    expect(result).toBe(media);
    expect(result.label).toBe("Test Media");
  });
});
