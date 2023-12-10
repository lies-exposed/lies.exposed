import { PatentEventArb } from "@liexp/shared/lib/tests/arbitrary/events/PatentEvent.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { fc } from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../../test/AppTest";
import { EventV2Entity } from "#entities/Event.v2.entity.js";

describe("Get Transaction List", () => {
  let appTest: AppTest;
  const eventsData = fc.sample(PatentEventArb, 100).map((e) => ({
    ...e,
    draft: false,
    media: [],
    links: [],
    keywords: [],
  }));

  beforeAll(async () => {
    appTest = await GetAppTest();

    await throwTE(appTest.ctx.db.save(EventV2Entity, eventsData as any[]));
  });

  afterAll(async () => {
    await throwTE(
      appTest.ctx.db.delete(
        EventV2Entity,
        eventsData.map((e) => e.id),
      ),
    );
  });

  test("Should return the patent list", async () => {
    const response = await appTest.req.get(`/v1/patents`);

    const body = response.body;
    expect(response.status).toEqual(200);
    expect(body.data).toHaveLength(20);
    expect(body.total).toBeGreaterThanOrEqual(100);
  });
});
