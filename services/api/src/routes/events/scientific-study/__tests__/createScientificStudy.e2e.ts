import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { EventV2Entity } from "@liexp/backend/lib/entities/Event.v2.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import {
  type UserTest,
  loginUser,
  saveUser,
} from "@liexp/backend/lib/test/user.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { SCIENTIFIC_STUDY } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/User.js";
import { http } from "@liexp/shared/lib/io/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { ActorArb } from "@liexp/shared/lib/tests/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/shared/lib/tests/arbitrary/Group.arbitrary.js";
import { HumanReadableStringArb } from "@liexp/shared/lib/tests/arbitrary/HumanReadableString.arbitrary.js";
import { LinkArb } from "@liexp/shared/lib/tests/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { fc } from "@liexp/test";
import { In } from "typeorm";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";

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

    admin = await saveUser(appTest.ctx, [AdminCreate.value]);

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
