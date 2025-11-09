import { AreaEntity } from "@liexp/backend/lib/entities/Area.entity.js";
import { ProjectEntity } from "@liexp/backend/lib/entities/Project.entity.js";
import { saveUser } from "@liexp/backend/lib/test/utils/user.utils.js";
import { pipe } from "@liexp/core/lib/fp/index.js";
import { http } from "@liexp/shared/lib/io/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { AreaArb } from "@liexp/test/lib/arbitrary/Area.arbitrary.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { ProjectArb } from "@liexp/test/lib/arbitrary/Project.arbitrary.js";
import { Schema } from "effect";
import fc from "fast-check";
import { type AppTest, GetAppTest } from "../../../../test/AppTest.js";
import { loginUser } from "../../../../test/utils/user.utils.js";

describe.skip("Edit Project ", () => {
  let appTest: AppTest;
  const users: any[] = [];
  let authorizationToken: string;
  let project: ProjectEntity;
  let area: AreaEntity;

  beforeAll(async () => {
    appTest = await GetAppTest();
    const user = await saveUser(appTest.ctx, ["admin:edit"]);
    users.push(user);
    const { authorization } = await loginUser(appTest)(user);
    authorizationToken = authorization;
    const [areaData] = fc.sample(AreaArb, 1).map((a) => ({
      ...a,
      featuredImage: null,
      media: [],
      events: [],
      socialPosts: [],
      creator: null,
    }));
    [area] = await throwTE(appTest.ctx.db.save(AreaEntity, [areaData]));
    const [projectData] = fc.sample(ProjectArb, 1);
    [project] = await pipe(
      appTest.ctx.db.save(ProjectEntity, [
        {
          ...projectData,
          media: [],
          areas: [area],
        },
      ]),
      throwTE,
    );
  });

  test("Should return a 200", async () => {
    const updateData = {
      name: fc.sample(fc.string())[0],
    };
    const response = await appTest.req
      .put(`/v1/projects/${project.id}`)
      .set("Authorization", authorizationToken)
      .send(updateData);

    expect(response.status).toEqual(200);

    expect(
      Schema.decodeUnknownEither(http.Project.Project)(response.body.data)._tag,
    ).toEqual("Right");

    const { updatedAt: _updatedAt, ...receivedBody } = response.body.data;
    const {
      updatedAt: _updatedAt2,
      deletedAt: _deletedAt,
      ...expectedBody
    } = project;
    expect(receivedBody).toMatchObject({
      ...expectedBody,
      ...updateData,
      areas: expectedBody.areas.map(({ deletedAt: _deletedAt4, ...a }) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      startDate: project.startDate.toISOString(),
      endDate: project.endDate ? project.endDate.toISOString() : undefined,
      createdAt: project.createdAt.toISOString(),
    });

    expect(response.body.data.media.length).toEqual(project.media.length);
    project.name = response.body.data.name;
  });

  test.skip("Should update media and return 200", async () => {
    const updateData = {
      media: fc.sample(MediaArb, 5).map(({ id: _id, ...i }) => ({
        ...i,
        kind: "THEORY",
      })),
    };
    const response = await appTest.req
      .put(`/v1/projects/${project.id}`)
      .set("Authorization", authorizationToken)
      .send(updateData);

    expect(response.status).toEqual(200);
    const body = response.body.data;
    const decodedBody = Schema.decodeUnknownEither(http.Project.Project)(body);
    expect(decodedBody._tag).toEqual("Right");

    const { updatedAt: _updatedAt3, ...receivedBody } = response.body.data;
    const {
      updatedAt: _updatedAt4,
      deletedAt: _deletedAt2,
      ...expectedBody
    } = project;
    expect(receivedBody).toMatchObject({
      ...expectedBody,
      areas: expectedBody.areas.map(({ deletedAt: _deletedAt3, ...a }) => ({
        ...a,
        createdAt: a.createdAt.toISOString(),
        updatedAt: a.updatedAt.toISOString(),
      })),
      startDate: project.startDate.toISOString(),
      endDate: project.endDate ? project.endDate.toISOString() : undefined,
      createdAt: project.createdAt.toISOString(),
      ...updateData,
    });

    expect(response.body.data.media.length).toEqual(
      project.media.length + updateData.media.length,
    );
  });
});
