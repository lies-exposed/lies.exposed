import { fp } from "@liexp/core/lib/fp/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { afterAll, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "./AppTest.js";

const g = global as any as { appTest?: AppTest };

beforeAll(async () => {
  if (!g.appTest) {
    await GetAppTest();
  }
});

afterAll(async () => {
  await Promise.all([
    throwTE(g.appTest?.ctx.db.close() ?? fp.TE.right(undefined)),
    // g.appTest?.ctx.tg.api.close(),
  ]).catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
  });
  g.appTest = undefined;
});
