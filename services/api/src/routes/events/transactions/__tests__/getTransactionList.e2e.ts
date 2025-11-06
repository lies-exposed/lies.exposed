import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { TransactionEventArb } from "@liexp/test/lib/arbitrary/events/TransactionEvent.arbitrary.js";
import fc from "fast-check";
import { type AppTest, GetAppTest } from "../../../../../test/AppTest.js";

describe("Get Transaction List", () => {
  let appTest: AppTest;
  const eventsData = fc.sample(TransactionEventArb, 100).map((e) => ({
    ...e,
    draft: false,
    media: [],
    links: [],
    keywords: [],
    socialPosts: [],
  }));

  beforeEach(async () => {
    appTest = await GetAppTest();

    await throwTE(appTest.ctx.db.save(EventV2Entity, eventsData));
  });

  test("Should return the transaction list", async () => {
    const response = await appTest.req.get(`/v1/transactions`);

    const body = response.body;
    expect(response.status).toEqual(200);
    expect(body.data).toHaveLength(20);
    expect(body.total).toBeGreaterThanOrEqual(100);
  });
});
