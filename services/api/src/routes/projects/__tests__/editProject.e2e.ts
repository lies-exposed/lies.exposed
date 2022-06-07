import { fc } from "@liexp/core/tests";
import { http } from "@liexp/shared/io";
import { MediaArb, ProjectArb, AreaArb } from "@liexp/shared/tests";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { pipe } from "fp-ts/lib/function";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { AreaEntity } from "@entities/Area.entity";
import { ProjectEntity } from "@entities/Project.entity";

describe("Edit Project ", () => {
  let appTest: AppTest,
    authorizationToken: string,
    project: ProjectEntity,
    area: AreaEntity;

  beforeAll(async () => {
    appTest = await initAppTest();

    const [areaData] = fc.sample(AreaArb, 1).map((a) => ({
      ...a,
      media: [],
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
      throwTE
    );

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await throwTE(appTest.ctx.db.delete(ProjectEntity, [project.id]));
    await throwTE(appTest.ctx.db.delete(AreaEntity, [area.id]));
    await throwTE(appTest.ctx.db.close());
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
      "Right"
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
      project.media.length + updateData.media.length
    );
  });
});
