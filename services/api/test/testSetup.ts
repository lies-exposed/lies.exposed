import { fp } from "@liexp/core/lib/fp";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { afterAll, beforeAll } from "vitest";
import { type AppTest, GetAppTest } from "./AppTest";

const g = global as any as { appTest?: AppTest };

beforeAll(async () => {
  if (!g.appTest) {
    await GetAppTest();
  }
});

afterAll(async () => {
  await throwTE(g.appTest?.ctx.db.close() ?? fp.TE.right(undefined)).catch(
    (e) => {
      // eslint-disable-next-line no-console
      console.error(e);
    },
  );
  g.appTest = undefined;
});
