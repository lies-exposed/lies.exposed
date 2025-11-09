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

  beforeAll(async () => {
    appTest = await GetAppTest();

    // eslint-disable-next-line no-console
    console.log("🔍 [TEST] Generated events count:", eventsData.length);
    // eslint-disable-next-line no-console
    console.log("🔍 [TEST] Sample event type:", eventsData[0]?.type);
    // eslint-disable-next-line no-console
    console.log("🔍 [TEST] Database manager exists:", !!appTest.ctx.db.manager);
    // eslint-disable-next-line no-console
    console.log(
      "🔍 [TEST] Connection initialized:",
      appTest.ctx.db.manager.connection?.isInitialized,
    );

    // Create events in beforeAll so they're visible to all tests in this suite
    // The transaction will roll back after all tests complete
    const savedEvents = await throwTE(
      appTest.ctx.db.save(EventV2Entity, eventsData),
    );

    // eslint-disable-next-line no-console
    console.log("✅ [TEST] Events saved successfully:", savedEvents.length);

    // Verify data was actually saved by querying
    const count = await appTest.ctx.db.manager.count(EventV2Entity, {
      where: { type: "Transaction" },
    });

    // eslint-disable-next-line no-console
    console.log("🔍 [TEST] Transaction events count in DB after save:", count);
  });

  test("Should return the transaction list", async () => {
    // eslint-disable-next-line no-console
    console.log("🧪 [TEST] Starting test - fetching transactions via HTTP");

    const response = await appTest.req.get(`/v1/transactions`);

    // eslint-disable-next-line no-console
    console.log("📡 [TEST] Response status:", response.status);
    // eslint-disable-next-line no-console
    console.log("📊 [TEST] Response body.total:", response.body.total);
    // eslint-disable-next-line no-console
    console.log(
      "📊 [TEST] Response body.data.length:",
      response.body.data?.length,
    );

    if (response.body.total === 0) {
      // Additional debugging when count is 0
      const dbCount = await appTest.ctx.db.manager.count(EventV2Entity, {
        where: { type: "Transaction" },
      });
      // eslint-disable-next-line no-console
      console.log("🔍 [TEST] Direct DB count at test time:", dbCount);
      // eslint-disable-next-line no-console
      console.log(
        "🔍 [TEST] Manager connection same?",
        appTest.ctx.db.manager.connection === appTest.ctx.db.manager.connection,
      );
    }

    const body = response.body;
    expect(response.status).toEqual(200);
    expect(body.data).toHaveLength(20);
    expect(body.total).toBeGreaterThanOrEqual(100);
  });
});
