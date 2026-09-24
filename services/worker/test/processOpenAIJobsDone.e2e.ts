import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { QueueEntity } from "@liexp/backend/lib/entities/Queue.entity.js";
import { QueueIO } from "@liexp/backend/lib/io/queue.io.js";
import {
  toLinkEntity,
  toMediaEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import type * as Queue from "@liexp/io/lib/http/Queue/index.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { Arbs, fc } from "@liexp/test/lib/index.js";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { beforeAll, describe, expect, test } from "vitest";
import { processDoneJob } from "../src/jobs/processOpenAIJobsDone.job.js";
import { type WorkerTest, GetAppTest } from "./WorkerTest.js";

describe("processDoneJob - links", () => {
  let Test: WorkerTest;

  beforeAll(async () => {
    Test = await GetAppTest();
  });

  const saveDoneLinkJob = async (
    link: LinkEntity,
    result: Record<string, unknown>,
  ): Promise<Queue.Queue> => {
    const [job] = await pipe(
      Test.ctx.db.save(QueueEntity, [
        {
          id: link.id,
          type: "openai-embedding",
          resource: "links",
          status: "done",
          prompt: null,
          model: null,
          data: { url: link.url, type: "link" },
          result,
          error: null,
        },
      ]),
      throwTE,
    );
    return pipe(QueueIO.decodeSingle(job), fp.TE.fromEither, throwTE);
  };

  const saveLink = async (image: MediaEntity | null): Promise<LinkEntity> => {
    const [link] = fc.sample(Arbs.Link.LinkArb, 1).map((l) => ({
      ...toLinkEntity({ ...l, image: undefined }),
      image,
    }));
    const [saved] = await pipe(Test.ctx.db.save(LinkEntity, [link]), throwTE);
    return saved;
  };

  const loadLink = (id: UUID) =>
    pipe(
      Test.ctx.db.findOneOrFail(LinkEntity, {
        where: { id: Equal(id) },
        loadRelationIds: { relations: ["image"] },
      }),
      throwTE,
    );

  test("Should not override an existing link image", async () => {
    const [media] = await pipe(
      Test.ctx.db.save(
        MediaEntity,
        fc.sample(Arbs.Media.MediaArb, 1).map(toMediaEntity),
      ),
      throwTE,
    );
    const link = await saveLink(media);

    const job = await saveDoneLinkJob(link, {
      title: "New title",
      description: "New description",
      publishDate: null,
      thumbnailUrl: `https://example.com/${link.id}/og-image.jpg`,
    });

    await pipe(processDoneJob(job)(Test.ctx), throwTE);

    const updated = await loadLink(link.id);
    expect(updated.image).toEqual(media.id);
    expect(updated.title).toEqual("New title");
    expect(updated.description).toEqual("New description");
  });

  test("Should set image from thumbnailUrl when link has none", async () => {
    const link = await saveLink(null);
    const thumbnailUrl = `https://example.com/${link.id}/og-image.jpg`;

    const job = await saveDoneLinkJob(link, {
      title: "Title",
      description: "Description",
      publishDate: null,
      thumbnailUrl,
    });

    await pipe(processDoneJob(job)(Test.ctx), throwTE);

    const updated = await loadLink(link.id);
    const image = await pipe(
      Test.ctx.db.findOneOrFail(MediaEntity, {
        where: { id: Equal(updated.image as UUID) },
      }),
      throwTE,
    );
    expect(image.location).toEqual(thumbnailUrl);
  });

  test("Should not wipe existing fields with empty results", async () => {
    const link = await saveLink(null);

    const job = await saveDoneLinkJob(link, {
      title: "",
      description: "",
      publishDate: null,
      thumbnailUrl: null,
    });

    await pipe(processDoneJob(job)(Test.ctx), throwTE);

    const updated = await loadLink(link.id);
    expect(updated.title).toEqual(link.title);
    expect(updated.description).toEqual(link.description);
    expect(updated.publishDate).toEqual(link.publishDate);
    expect(updated.image).toBeNull();
  });
});
