import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { HumanReadableStringArb } from "@liexp/shared/lib/tests/arbitrary/HumanReadableString.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { fc } from "@liexp/test";
import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { EventV2Entity } from "../../entities/Event.v2.entity.js";
import { UserEntity } from "../../entities/User.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import {
  createEventFromURL,
  type CreateEventFromURLContext,
} from "./createEventFromURL.flow.js";

describe(createEventFromURL.name, () => {
  const appTest = {
    ctx: mockedContext<CreateEventFromURLContext>({
      puppeteer: mock(),
      db: mock(),
      ner: mock(),
      fs: mock(),
      urlMetadata: mock(),
    }),
  };

  it("should create an event from a URL", async () => {
    const [url] = fc
      .sample(fc.nat(), 1)
      .map((id) => `https://www.sciencedirect.com/article/${id}` as any);

    const title = fc.sample(HumanReadableStringArb(), 1)[0];
    const description = fc.sample(HumanReadableStringArb(), 1)[0];

    // no url in db
    mockTERightOnce(appTest.ctx.db.execQuery, () => null);
    // event by url
    mockTERightOnce(appTest.ctx.puppeteer.execute, () =>
      fp.O.some({
        type: SCIENTIFIC_STUDY.value,
        date: new Date(),
        payload: {
          title,
          url,
          description,
        },
      }),
    );

    // link by url
    let savedEvent: any;
    mockTERightOnce(appTest.ctx.db.save, (_, event) => {
      savedEvent = event[0];
      return event;
    });

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => savedEvent);

    const user = new UserEntity();

    const event: any = await pipe(
      createEventFromURL(
        user,
        uuid(),
        url,
        SCIENTIFIC_STUDY.value,
      )(appTest.ctx),
      throwTE,
    );

    expect(appTest.ctx.db.save).toHaveBeenCalledWith(EventV2Entity, [
      expect.objectContaining({
        type: SCIENTIFIC_STUDY.value,
        payload: {
          title,
          description,
          url: sanitizeURL(url),
        },
      }),
    ]);

    expect(event.type).toBe(SCIENTIFIC_STUDY.value);
    expect(event.date).toBe(savedEvent.date);

    expect(event.payload).toMatchObject(savedEvent.payload);
  });
});
