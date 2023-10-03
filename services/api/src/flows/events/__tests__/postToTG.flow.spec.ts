import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { fc } from "@liexp/test";
import { pipe } from "fp-ts/function";
import { postToTG } from "../postToTG.flow";

describe.skip("PostToTG Flow", () => {
  it("should post video with duration", async () => {
    const uuid: any = fc.sample(fc.uuid(), 1)[0];
    const result = await pipe(
      postToTG({
        db: {},
      } as any)(uuid, {
        title: "my title",
        content: undefined,
        media: [],
        keywords: [],
        actors: [],
        groups: [],
        url: "",
        date: new Date().toISOString(),
        schedule: undefined,
        platforms: { TG: true, IG: true },
      }),
      throwTE,
    );
    expect(result).toBeDefined();
  });
});
