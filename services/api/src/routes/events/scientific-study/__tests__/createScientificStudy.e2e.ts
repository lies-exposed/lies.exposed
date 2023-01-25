import { http } from "@liexp/shared/io";
import { SCIENTIFIC_STUDY } from "@liexp/shared/io/http/Events/ScientificStudy";
import { AdminCreate } from "@liexp/shared/io/http/User";
import { createExcerptValue } from "@liexp/shared/slate";
import { ActorArb } from "@liexp/shared/tests/arbitrary/Actor.arbitrary";
import { GroupArb } from "@liexp/shared/tests/arbitrary/Group.arbitrary";
import { HumanReadableStringArb } from "@liexp/shared/tests/arbitrary/HumanReadableString.arbitrary";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { fc } from "@liexp/test";
import { type AppTest, GetAppTest } from "../../../../../test/AppTest";
import { loginUser, saveUser } from "../../../../../test/user.utils";
import { ActorEntity } from "@entities/Actor.entity";
import { EventV2Entity } from "@entities/Event.v2.entity";
import { GroupEntity } from "@entities/Group.entity";

describe("Create Scientific Study", () => {
  let appTest: AppTest;
  let authorizationToken: string;
  const scientificStudyIds: any[] = [];
  const [actor] = fc.sample(ActorArb, 1);
  const [group] = fc.sample(GroupArb, 1);

  beforeAll(async () => {
    appTest = GetAppTest();

    await throwTE(
      appTest.ctx.db.save(ActorEntity, [
        { ...actor, death: undefined, memberIn: [] },
      ])
    );
    await throwTE(
      appTest.ctx.db.save(GroupEntity, [{ ...group, members: [] }])
    );

    const admin = await saveUser(appTest, [AdminCreate.value]);

    authorizationToken = await loginUser(appTest)(admin).then(
      ({ authorization }) => authorization
    );
  });

  afterAll(async () => {
    await throwTE(appTest.ctx.db.delete(EventV2Entity, scientificStudyIds));
    await throwTE(appTest.ctx.db.delete(ActorEntity, [actor.id]));
    await throwTE(appTest.ctx.db.delete(GroupEntity, [group.id]));
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
      undefined
    );
    appTest.mocks.puppeteer.page.$x.mockResolvedValueOnce([
      {
        evaluate: jest.fn().mockResolvedValue(description),
      },
    ]);

    const response = await appTest.req
      .post(`/v1/scientific-studies`)
      .set("Authorization", authorizationToken)
      .send(scientificStudyData);

    const body = response.body.data;
    expect(response.status).toEqual(201);

    expect(body.type).toBe(SCIENTIFIC_STUDY.value);
    expect(body.date).toBeDefined();
    expect(body.payload.url).toEqual(url);
    expect(body.payload.title).toEqual(title);

    scientificStudyIds.push(body.id);
  });

  test("Should create a scientific study from plain object", async () => {
    const [url] = fc
      .sample(fc.nat(), 1)
      .map((id) => `https://www.sciencedirect.com/article/${id}` as any);

    const title = fc.sample(HumanReadableStringArb(), 1)[0];
    const [excerpt] = fc
      .sample(HumanReadableStringArb(), 1)
      .map((d) => createExcerptValue(d));

    const scientificStudyData: http.Events.ScientificStudy.CreateScientificStudyBody =
      {
        type: http.Events.ScientificStudy.SCIENTIFIC_STUDY.value,
        draft: true,
        date: new Date(),
        excerpt,
        body: undefined,
        payload: {
          title,
          url,
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
    expect(body.payload.url).toEqual(url);
    expect(body.payload.title).toEqual(title);

    scientificStudyIds.push(body.id);
  });
});
