import { http } from "@liexp/shared/lib/io";
import { MediaArb, ProjectArb, AreaArb } from "@liexp/shared/lib/tests";
import { throwTE } from "@liexp/shared/lib/utils/task.utils";
import { fc } from "@liexp/test";
import { pipe } from "fp-ts/function";
import { type AppTest, GetAppTest } from "../../../../test/AppTest";
import { loginUser, saveUser } from "../../../../test/user.utils";
import { AreaEntity } from "@entities/Area.entity";
import { ProjectEntity } from "@entities/Project.entity";
import { UserEntity } from "@entities/User.entity";

describe("Edit Project ", () => {
  let appTest: AppTest;
  const users: any[] = [];
  let authorizationToken: string;
  let project: ProjectEntity;
  let area: AreaEntity;

  beforeAll(async () => {
    appTest = await GetAppTest();
    const user = await saveUser(appTest, ["admin:edit"]);
    users.push(user);
    const { authorization } = await loginUser(appTest)(user);
    authorizationToken = authorization;
    const [areaData] = fc.sample(AreaArb, 1).map((a) => ({
      ...a,
      media: [],
      socialPosts: []
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

  afterAll(async () => {
    await throwTE(appTest.ctx.db.delete(ProjectEntity, [project.id]));
    await throwTE(appTest.ctx.db.delete(AreaEntity, [area.id]));
    await throwTE(
      appTest.ctx.db.delete(
        UserEntity,
        users.map((u) => u.id),
      ),
    );
    await appTest.utils.e2eAfterAll();
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

    expect(http.Project.Project.decode(response.body.data)._tag).toEqual(
      "Right",
    );

    const { updatedAt, ...receivedBody } = response.body.data;
    const { updatedAt: _, deletedAt: _deletedAt, ...expectedBody } = project;
    expect(receivedBody).toMatchObject({
      ...expectedBody,
      ...updateData,
      areas: expectedBody.areas.map(({ deletedAt, ...a }) => ({
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
      media: fc.sample(MediaArb, 5).map(({ id, ...i }) => ({
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
    const decodedBody = http.Project.Project.decode(body);
    expect(decodedBody._tag).toEqual("Right");

    const { updatedAt, ...receivedBody } = response.body.data;
    const { updatedAt: _, deletedAt: _deletedAt, ...expectedBody } = project;
    expect(receivedBody).toMatchObject({
      ...expectedBody,
      areas: expectedBody.areas.map(({ deletedAt, ...a }) => ({
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
