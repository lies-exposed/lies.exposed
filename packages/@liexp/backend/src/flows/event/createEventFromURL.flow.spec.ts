import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { HumanReadableStringArb } from "@liexp/shared/lib/tests/arbitrary/HumanReadableString.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { fc } from "@liexp/test";
import { describe, expect, it } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { EventV2Entity } from "../../entities/Event.v2.entity.js";
import { UserEntity } from "../../entities/User.entity.js";
import { initContext } from "../../test/index.js";
import { mockedContext, mockTERightOnce } from "../../test/mocks/mock.utils.js";
import {
  createEventFromURL,
  type CreateEventFromURLContext,
} from "./createEventFromURL.flow.js";

describe(createEventFromURL.name, () => {
  const appTest = {
    ctx: mockedContext<CreateEventFromURLContext>({
      puppeteer: mockDeep(),
      logger: mockDeep(),
      db: mockDeep(),
      ner: mockDeep(),
      fs: mockDeep(),
      urlMetadata: mockDeep(),
      config: initContext().config,
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

    // mocks.urlMetadata.fetchMetadata.mockResolvedValue({
    //   title,
    //   description,
    //   url: scientificStudyData.url,
    //   keywords: [],
    // });

    // mockTERightOnce(appTest.ctx.puppeteer.getBrowser, () => null);
    // mocks.puppeteer.page.goto.mockResolvedValueOnce(undefined);

    // // evaluate title
    // mocks.puppeteer.page.$eval.mockResolvedValueOnce(title);
    // // evaluate dropdown click
    // mocks.puppeteer.page.click.mockResolvedValueOnce(undefined);
    // // evaluate date string
    // mocks.puppeteer.page.$eval.mockResolvedValueOnce([
    //   "Received 27 July 2020",
    //   "Accepted 1 August 2020",
    // ]);
    // // wait for
    // mocks.puppeteer.page.waitForSelector.mockResolvedValueOnce(undefined);
    // mocks.puppeteer.page.$$.mockResolvedValueOnce([
    //   {
    //     evaluate: vi.fn().mockResolvedValue(description),
    //   },
    // ]);

    // mocks.puppeteer.page.$eval.mockResolvedValueOnce("page content");

    // mocks.ner.winkMethods.learnCustomEntities.mockResolvedValueOnce({} as any);
    // mocks.ner.doc.out.mockReturnValue([]);
    // mocks.ner.doc.sentences.mockReturnValue({ each: vi.fn() } as any);
    // mocks.ner.doc.customEntities.mockReturnValue({
    //   out: vi.fn().mockReturnValue([]),
    // } as any);
    // mocks.ner.doc.tokens.mockReturnValue({ each: vi.fn() } as any);

    // mocks.fs.existsSync.mockReturnValue(false);
    // mocks.fs.readFileSync.mockReturnValue("[]");

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
