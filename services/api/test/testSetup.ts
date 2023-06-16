import { afterAll, beforeAll } from "vitest";
import { AppTest, GetAppTest } from "./AppTest";
// import { throwTE } from '@liexp/shared/lib/utils/task.utils';

const g = global as any as { appTest?: AppTest };

beforeAll(async () => {
  if (!g.appTest) {
    await GetAppTest();
  }
});

afterAll(async () => {
  // await throwTE(g.appTest!.ctx.db.close());
  delete g.appTest;
});
