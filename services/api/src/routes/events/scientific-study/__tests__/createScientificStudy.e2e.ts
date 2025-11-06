import { ActorEntity } from "@liexp/backend/lib/entities/Actor.entity.js";
import { GroupEntity } from "@liexp/backend/lib/entities/Group.entity.js";
import { LinkEntity } from "@liexp/backend/lib/entities/Link.entity.js";
import {
  saveUser,
  type UserTest,
} from "@liexp/backend/lib/test/utils/user.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { EVENT_TYPES } from "@liexp/shared/lib/io/http/Events/EventType.js";
import { AdminCreate } from "@liexp/shared/lib/io/http/auth/permissions/index.js";
import { type http } from "@liexp/shared/lib/io/index.js";
import { toInitialValue } from "@liexp/shared/lib/providers/blocknote/utils.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { ActorArb } from "@liexp/test/lib/arbitrary/Actor.arbitrary.js";
import { GroupArb } from "@liexp/test/lib/arbitrary/Group.arbitrary.js";
import { HumanReadableStringArb } from "@liexp/test/lib/arbitrary/HumanReadableString.arbitrary.js";
import { LinkArb } from "@liexp/test/lib/arbitrary/Link.arbitrary.js";
import fc from "fast-check";
import { GetAppTest, type AppTest } from "../../../../../test/AppTest.js";
import { loginUser } from "../../../../../test/utils/user.utils.js";

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
          nationalities: [],
        },
      ]),
    );
    await throwTE(
      appTest.ctx.db.save(GroupEntity, [
        { ...group, avatar: undefined, members: [] },
      ]),
    );

    admin = await saveUser(appTest.ctx, [AdminCreate.literals[0]]);

    authorizationToken = await loginUser(appTest)(admin).then(
      ({ authorization }) => authorization,
    );
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
        type: EVENT_TYPES.SCIENTIFIC_STUDY,
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

    expect(body.type).toBe(EVENT_TYPES.SCIENTIFIC_STUDY);
    expect(body.date).toBeDefined();
    expect(body.excerpt).toEqual(excerpt);
    expect(body.payload.url).toEqual(link.id);
    expect(body.payload.title).toEqual(title);

    scientificStudyIds.push(body.id);
  });
});
