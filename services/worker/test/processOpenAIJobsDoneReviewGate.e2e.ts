import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { KeywordEntity } from "@liexp/backend/lib/entities/Keyword.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import { QueueEntity } from "@liexp/backend/lib/entities/Queue.entity.js";
import { QueueIO } from "@liexp/backend/lib/io/queue.io.js";
import {
  toKeywordEntity,
  toLinkEntity,
} from "@liexp/backend/lib/test/utils/entities/index.js";
import { fp } from "@liexp/core/lib/fp/index.js";
import { type UUID } from "@liexp/io/lib/http/Common/UUID.js";
import { EVENT_TYPES } from "@liexp/io/lib/http/Events/EventType.js";
import { Event } from "@liexp/io/lib/http/Events/index.js";
import type * as Queue from "@liexp/io/lib/http/Queue/index.js";
import { type UpdateEventAgentOutput } from "@liexp/io/lib/http/Queue/index.js";
import { mergeEventExtraction } from "@liexp/shared/lib/helpers/event/mergeEventExtraction.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/fp.utils.js";
import { KeywordArb } from "@liexp/test/lib/arbitrary/Keyword.arbitrary.js";
import { UncategorizedArb } from "@liexp/test/lib/arbitrary/events/Uncategorized.arbitrary.js";
import { Arbs, fc } from "@liexp/test/lib/index.js";
import { Schema } from "effect";
import { pipe } from "fp-ts/lib/function.js";
import { Equal } from "typeorm";
import { beforeAll, describe, expect, test } from "vitest";
import {
  processDoneJob,
  processOpenAIJobsDone,
} from "../src/jobs/processOpenAIJobsDone.job.js";
import { type WorkerTest, GetAppTest } from "./WorkerTest.js";

const UPDATE_EVENT_TYPE = "openai-update-event";

const emptyOutput = (): UpdateEventAgentOutput => ({
  title: null,
  date: null,
  excerpt: null,
  location: null,
  endDate: null,
  quote: null,
  details: null,
  total: null,
  currency: null,
  actors: [],
  groups: [],
  keywords: [],
  missing: { actors: [], groups: [], keywords: [] },
  changes: [],
});

const getTest = async (): Promise<WorkerTest> => GetAppTest();

const deleteQueueRows = async (Test: WorkerTest, id: UUID): Promise<void> => {
  await pipe(Test.ctx.db.delete(QueueEntity, [{ id }]), throwTE);
};

const saveEvent = async (
  Test: WorkerTest,
  overrides: Partial<EventV2Entity> = {},
): Promise<EventV2Entity> => {
  const [event] = fc.sample(UncategorizedArb, 1).map((e) => ({
    ...e,
    draft: false,
    date: new Date("2024-01-01T00:00:00.000Z"),
    excerpt: toInitialValue("Original excerpt"),
    body: toInitialValue("Original body"),
    media: [],
    links: [],
    keywords: [],
    socialPosts: [],
    payload: {
      title: "Original title",
      location: undefined,
      endDate: undefined,
      actors: [],
      groups: [],
      groupsMembers: [],
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }));
  const [saved] = await pipe(Test.ctx.db.save(EventV2Entity, [event]), throwTE);
  return saved;
};

const saveDoneUpdateEventJob = async (
  Test: WorkerTest,
  eventId: UUID,
  result: Record<string, unknown> | null,
): Promise<Queue.Queue> => {
  const [job] = await pipe(
    Test.ctx.db.save(QueueEntity, [
      {
        id: eventId,
        type: UPDATE_EVENT_TYPE,
        resource: "events",
        status: "done",
        prompt: null,
        model: null,
        data: { id: eventId, type: EVENT_TYPES.UNCATEGORIZED },
        result,
        error: null,
      },
    ]),
    throwTE,
  );
  return pipe(
    QueueIO.decodeSingle(job),
    fp.TE.fromEither,
    fp.TE.mapLeft((e) => new Error(e.message)),
    throwTE,
  );
};

const toReviewResult = (
  event: EventV2Entity,
  output: UpdateEventAgentOutput,
): Record<string, unknown> => {
  const { deletedAt: _deletedAt, ...rest } = event;
  return JSON.parse(
    JSON.stringify(
      mergeEventExtraction(
        { ...rest, keywords: [], media: [], links: [] },
        output,
      ),
    ),
  );
};

const loadQueueRow = async (
  Test: WorkerTest,
  id: UUID,
  type: string,
): Promise<{ status: string } | undefined> => {
  const rows = await pipe(
    Test.ctx.db.execQuery<{ status: string }>((em) =>
      em.query(
        `SELECT status FROM queue WHERE id = $1 AND type = $2 LIMIT 1;`,
        [id, type],
      ),
    ),
    throwTE,
  );
  return rows[0];
};

const loadEvent = async (Test: WorkerTest, id: UUID): Promise<EventV2Entity> =>
  pipe(
    Test.ctx.db.findOneOrFail(EventV2Entity, { where: { id: Equal(id) } }),
    throwTE,
  );

describe("processOpenAIJobsDone - review gate", () => {
  let Test: WorkerTest;

  beforeAll(async () => {
    Test = await getTest();
  });

  test("Should leave a done openai-update-event job untouched", async () => {
    const event = await saveEvent(Test);
    const result = toReviewResult(event, {
      ...emptyOutput(),
      title: "Title the cron must not apply",
    });
    const job = await saveDoneUpdateEventJob(Test, event.id, result);

    try {
      await processOpenAIJobsDone()(Test.ctx)();

      const queueRow = await loadQueueRow(Test, job.id, UPDATE_EVENT_TYPE);
      expect(queueRow?.status).toEqual("done");

      const stored = await loadEvent(Test, event.id);
      expect((stored.payload as { title: string }).title).toEqual(
        "Original title",
      );
    } finally {
      await deleteQueueRows(Test, event.id);
    }
  });

  test("Should still apply other done job types", async () => {
    const [link] = fc.sample(Arbs.Link.LinkArb, 1).map((l) => ({
      ...toLinkEntity({ ...l, image: undefined }),
      image: null,
    }));
    const [savedLink] = await pipe(
      Test.ctx.db.save(LinkEntity, [link]),
      throwTE,
    );

    const [embeddingJob] = await pipe(
      Test.ctx.db.save(QueueEntity, [
        {
          id: savedLink.id,
          type: "openai-embedding",
          resource: "links",
          status: "done",
          prompt: null,
          model: null,
          data: { url: savedLink.url, type: "link" },
          result: {
            title: "Cron applied title",
            description: "",
            publishDate: null,
            thumbnailUrl: null,
          },
          error: null,
        },
      ]),
      throwTE,
    );

    try {
      await processOpenAIJobsDone()(Test.ctx)();

      const updatedLink = await pipe(
        Test.ctx.db.findOneOrFail(LinkEntity, {
          where: { id: Equal(savedLink.id) },
          loadRelationIds: { relations: ["image"] },
        }),
        throwTE,
      );
      expect(updatedLink.title).toEqual("Cron applied title");

      const queueRow = await loadQueueRow(
        Test,
        embeddingJob.id,
        "openai-embedding",
      );
      expect(queueRow?.status).toEqual("completed");
    } finally {
      await deleteQueueRows(Test, savedLink.id);
    }
  });
});

describe("processDoneJob - openai-update-event", () => {
  let Test: WorkerTest;

  beforeAll(async () => {
    Test = await getTest();
  });

  test("Should apply the reviewed result and keep draft false", async () => {
    const event = await saveEvent(Test);
    const [keyword] = await pipe(
      Test.ctx.db.save(
        KeywordEntity,
        fc.sample(KeywordArb, 1).map(toKeywordEntity),
      ),
      throwTE,
    );

    const result = toReviewResult(event, {
      ...emptyOutput(),
      title: "Reviewed title",
      date: new Date("2024-06-06T00:00:00.000Z"),
      excerpt: "Reviewed excerpt",
      keywords: [keyword.id],
      missing: { actors: ["Jane Doe"], groups: [], keywords: [] },
    });

    const job = await saveDoneUpdateEventJob(Test, event.id, result);

    try {
      await pipe(processDoneJob(job)(Test.ctx), throwTE);

      const stored = await loadEvent(Test, event.id);
      expect(stored.draft).toBe(false);
      expect((stored.payload as { title: string }).title).toEqual(
        "Reviewed title",
      );
      expect(stored.date.toISOString()).toEqual("2024-06-06T00:00:00.000Z");

      const queueRow = await loadQueueRow(Test, job.id, UPDATE_EVENT_TYPE);
      expect(queueRow?.status).toEqual("completed");

      // the worker decodes the reviewed result back into an Event: the merge
      // report rides along in the result JSON but is dropped by the decode.
      const decodedEvent = Schema.decodeUnknownSync(Event)(result);
      expect((decodedEvent as { report?: unknown }).report).toBeUndefined();
    } finally {
      await deleteQueueRows(Test, event.id);
    }
  });

  test("Should keep draft true when the stored event is a draft", async () => {
    const event = await saveEvent(Test, { draft: true });
    const result = toReviewResult(event, {
      ...emptyOutput(),
      title: "Draft title",
    });
    const job = await saveDoneUpdateEventJob(Test, event.id, result);

    try {
      await pipe(processDoneJob(job)(Test.ctx), throwTE);

      const stored = await loadEvent(Test, event.id);
      expect(stored.draft).toBe(true);
      expect((stored.payload as { title: string }).title).toEqual(
        "Draft title",
      );
    } finally {
      await deleteQueueRows(Test, event.id);
    }
  });
});
