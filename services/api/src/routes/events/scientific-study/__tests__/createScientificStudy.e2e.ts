import { pipe } from "@liexp/core/lib/fp/index.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/User.js";
import { http } from "@liexp/shared/lib/io/index.js";
import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/shared/lib/tests/arbitrary/Group.arbitrary.js";
import { HumanReadableStringArb } from "@liexp/shared/lib/tests/arbitrary/HumanReadableString.arbitrary.js";
import { LinkArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { sanitizeURL } from "@liexp/shared/lib/utils/url.utils.js";
import { fc } from "@liexp/test";
import { toInitialValue } from "@liexp/ui/lib/components/Common/BlockNote/utils/utils.js";
import { In } from "typeorm";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import {
  type UserTest,
  loginUser,
  saveUser,
} from "../../../../../test/user.utils.js";
import { ActorEntity } from "#entities/Actor.entity.js";
import { EventV2Entity } from "#entities/Event.v2.entity.js";
import { GroupEntity } from "#entities/Group.entity.js";
import { LinkEntity } from "#entities/Link.entity.js";

describe("Create Scientific Study", () => {
  let appTest: AppTest;
  let admin: UserTest;
  let authorizationToken: string;
  const scientificStudyIds: any[] = [];
  const [actor] = fc.sample(ActorArb, 1);
  const [group] = fc.sample(GroupArb, 1);

  beforeAll(async () => {
    appTest = await GetAppTest();

    await throwTE(
      appTest.ctx.db.save(ActorEntity, [
        {
          ...actor,
          avatar: undefined,
          diedOn: undefined,
          bornOn: undefined,
          memberIn: [],
        },
      ]),
    );
    await throwTE(
      appTest.ctx.db.save(GroupEntity, [
        { ...group, avatar: undefined, members: [] },
      ]),
    );

    admin = await saveUser(appTest, [AdminCreate.value]);

    authorizationToken = await loginUser(appTest)(admin).then(
      ({ authorization }) => authorization,
    );
  });

  afterAll(async () => {
    const ev: any[] = await throwTE(
      appTest.ctx.db.find(EventV2Entity, {
        where: { id: In(scientificStudyIds) },
      }),
    );
    await throwTE(appTest.ctx.db.delete(EventV2Entity, scientificStudyIds));
    await throwTE(appTest.ctx.db.delete(ActorEntity, [actor.id]));
    await throwTE(appTest.ctx.db.delete(GroupEntity, [group.id]));
    const ll = await throwTE(
      appTest.ctx.db.find(LinkEntity, {
        where: {
          id: In(ev.map((e) => e.payload.url)),
        },
      }),
    );
    await throwTE(
      appTest.ctx.db.delete(
        LinkEntity,
        ll.map((l) => l.id),
      ),
    );
    await appTest.utils.e2eAfterAll();
  });

  test("Should create a scientific study from url", async () => {
    const [url] = fc
      .sample(fc.nat(), 1)
      .map((id) => `https://www.sciencedirect.com/article/${id}` as any);

    const title = fc.sample(HumanReadableStringArb(), 1)[0];
    const description = fc.sample(HumanReadableStringArb(), 1)[0];

    const scientificStudyData = { url };

    appTest.mocks.urlMetadata.fetchMetadata.mockResolvedValue({
      title,
      description,
      url: scientificStudyData.url,
      keywords: [],
    });

    appTest.mocks.puppeteer.page.goto.mockResolvedValueOnce(undefined);

    // evaluate title
    appTest.mocks.puppeteer.page.$eval.mockResolvedValueOnce(title);
    // evaluate dropdown click
    appTest.mocks.puppeteer.page.click.mockResolvedValueOnce(undefined);
    // evaluate date string
    appTest.mocks.puppeteer.page.$eval.mockResolvedValueOnce([
      "Received 27 July 2020",
      "Accepted 1 August 2020",
    ]);
    // wait for
    appTest.mocks.puppeteer.page.waitForSelector.mockResolvedValueOnce(
      undefined,
    );
    appTest.mocks.puppeteer.page.$x.mockResolvedValueOnce([
      {
        evaluate: vi.fn().mockResolvedValue(description),
      },
    ]);

    appTest.mocks.puppeteer.page.$eval.mockResolvedValueOnce("page content");

    appTest.mocks.ner.winkMethods.learnCustomEntities.mockResolvedValueOnce(
      {} as any,
    );
    appTest.mocks.ner.doc.out.mockReturnValue([]);
    appTest.mocks.ner.doc.sentences.mockReturnValue({ each: vi.fn() } as any);
    appTest.mocks.ner.doc.customEntities.mockReturnValue({
      out: vi.fn().mockReturnValue([]),
    } as any);
    appTest.mocks.ner.doc.tokens.mockReturnValue({ each: vi.fn() } as any);

    const response = await appTest.req
      .post(`/v1/scientific-studies`)
      .set("Authorization", authorizationToken)
      .send(scientificStudyData);

    const body = response.body.data;
    expect(response.status).toEqual(201);

    expect(appTest.mocks.ner).toHaveBeenCalledTimes(1);
    expect(
      appTest.mocks.ner.winkMethods.learnCustomEntities,
    ).toHaveBeenCalledTimes(1);
    expect(appTest.mocks.ner.winkMethods.readDoc).toHaveBeenCalledTimes(1);
    expect(appTest.mocks.ner.doc.out).toHaveBeenCalledTimes(1);

    const link = await pipe(
      appTest.ctx.db.findOneOrFail(LinkEntity, {
        where: { url: sanitizeURL(scientificStudyData.url) },
      }),
      throwTE,
    );

    expect(body.type).toBe(SCIENTIFIC_STUDY.value);
    expect(body.date).toBeDefined();
    expect(body.payload.url).toEqual(link.id);
    expect(body.payload.title).toEqual(title);

    scientificStudyIds.push(body.id);
  });

  test("Should create a scientific study from plain object", async () => {
    const [link] = await pipe(
      fc.sample(LinkArb, 1)[0],
      (l) =>
        appTest.ctx.db.save(LinkEntity, [
          {
            ...l,
            image: undefined,
            creator: { id: admin.id },
            events: [],
            keywords: [],
            socialPosts: [],
          },
        ]),
      throwTE,
    );

    const title = fc.sample(HumanReadableStringArb(), 1)[0];
    const [excerpt] = fc
      .sample(HumanReadableStringArb(), 1)
      .map((d) => toInitialValue(d));

    const scientificStudyData: http.Events.ScientificStudy.CreateScientificStudyBody =
      {
        type: http.Events.EventTypes.SCIENTIFIC_STUDY.value,
        draft: true,
        date: new Date(),
        excerpt,
        body: undefined,
        payload: {
          title,
          url: link.id,
          authors: [],
          publisher: undefined,
          image: undefined,
        },
        media: [],
        links: [],
        keywords: [],
      };

    const response = await appTest.req
      .post(`/v1/scientific-studies`)
      .set("Authorization", authorizationToken)
      .send(scientificStudyData);

    const body = response.body.data;
    expect(response.status).toEqual(201);

    expect(body.type).toBe(SCIENTIFIC_STUDY.value);
    expect(body.date).toBeDefined();
    expect(body.excerpt).toEqual(excerpt);
    expect(body.payload.url).toEqual(link.id);
    expect(body.payload.title).toEqual(title);

    scientificStudyIds.push(body.id);
  });
});
