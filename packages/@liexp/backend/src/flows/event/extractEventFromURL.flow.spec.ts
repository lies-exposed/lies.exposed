import { fp, pipe } from "@liexp/core/lib/fp/index.js";
import { uuid } from "@liexp/shared/lib/io/http/Common/UUID.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { HumanReadableStringArb } from "@liexp/shared/lib/tests/arbitrary/HumanReadableString.arbitrary.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { fc } from "@liexp/test";
import { describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { LinkEntity } from "../../entities/Link.entity.js";
import { UserEntity } from "../../entities/User.entity.js";
import { mockedContext } from "../../test/context.js";
import { mockTERightOnce } from "../../test/mocks/mock.utils.js";
import { mocks } from "../../test/mocks.js";
import {
  createEventFromURL,
  type CreateEventFromURLContext,
} from "./createEventFromURL.flow.js";
import { extractEventFromURL } from "./extractEventFromURL.flow.js";

describe.skip(extractEventFromURL.name, () => {
  const appTest = {
    ctx: mockedContext<CreateEventFromURLContext>({
      puppeteer: mockDeep(),
      db: mockDeep(),
      ner: mockDeep(),
      fs: mockDeep(),
      urlMetadata: mockDeep(),
    }),
  };

  it("should create an event from a URL", async () => {
    const [url] = fc
      .sample(fc.nat(), 1)
      .map((id) => `https://www.sciencedirect.com/article/${id}` as any);

    const title = fc.sample(HumanReadableStringArb(), 1)[0];
    const description = fc.sample(HumanReadableStringArb(), 1)[0];

    const scientificStudyData = { url };

    // event by url
    mockTERightOnce(appTest.ctx.db.execQuery, () => null);
    // link by url
    mockTERightOnce(appTest.ctx.db.findOne, () => null);
    // save link
    let savedEvent: any;
    appTest.ctx.db.save.mockImplementation((_, link) => {
      const l: any = link;
      if (l[0].type === SCIENTIFIC_STUDY.value) {
        savedEvent = l[0];
      }
      return fp.TE.right(link);
    });

    mockTERightOnce(appTest.ctx.db.findOneOrFail, () => savedEvent);

    mocks.redis.publish.mockResolvedValue(1);
    mocks.urlMetadata.fetchMetadata.mockResolvedValue({
      title,
      description,
      url: scientificStudyData.url,
      keywords: [],
    });

    mockTERightOnce(appTest.ctx.puppeteer.getBrowser, () => null);
    mocks.puppeteer.page.goto.mockResolvedValueOnce(undefined);

    // evaluate title
    mocks.puppeteer.page.$eval.mockResolvedValueOnce(title);
    // evaluate dropdown click
    mocks.puppeteer.page.click.mockResolvedValueOnce(undefined);
    // evaluate date string
    mocks.puppeteer.page.$eval.mockResolvedValueOnce([
      "Received 27 July 2020",
      "Accepted 1 August 2020",
    ]);
    // wait for
    mocks.puppeteer.page.waitForSelector.mockResolvedValueOnce(undefined);
    mocks.puppeteer.page.$$.mockResolvedValueOnce([
      {
        evaluate: vi.fn().mockResolvedValue(description),
      },
    ]);

    mocks.puppeteer.page.$eval.mockResolvedValueOnce("page content");

    mocks.ner.winkMethods.learnCustomEntities.mockResolvedValueOnce({} as any);
    mocks.ner.doc.out.mockReturnValue([]);
    mocks.ner.doc.sentences.mockReturnValue({ each: vi.fn() } as any);
    mocks.ner.doc.customEntities.mockReturnValue({
      out: vi.fn().mockReturnValue([]),
    } as any);
    mocks.ner.doc.tokens.mockReturnValue({ each: vi.fn() } as any);

    mocks.fs.existsSync.mockReturnValue(false);
    mocks.fs.readFileSync.mockReturnValue("[]");

    const user = new UserEntity();

    const event: any = await pipe(
      createEventFromURL(
        user,
        uuid(),
        scientificStudyData.url,
        SCIENTIFIC_STUDY.value,
      )(appTest.ctx),
      throwTE,
    );

    expect(mocks.ner).toHaveBeenCalledTimes(1);
    expect(mocks.ner.winkMethods.learnCustomEntities).toHaveBeenCalledTimes(1);
    expect(mocks.ner.winkMethods.readDoc).toHaveBeenCalledTimes(1);
    expect(mocks.ner.doc.out).toHaveBeenCalledTimes(1);

    expect(mocks.db.connection.manager.save).toHaveBeenCalledWith(
      LinkEntity,

      [
        expect.objectContaining({
          url: sanitizeURL(scientificStudyData.url),
        }),
      ],
      undefined,
    );

    expect(event.type).toBe(SCIENTIFIC_STUDY.value);
    expect(event.date).toBeDefined();

    expect(event.payload.url).toBeInstanceOf(String);
    expect(event.payload.title).toEqual(title);
  });
});
