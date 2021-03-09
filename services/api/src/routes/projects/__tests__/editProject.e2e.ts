import { fc } from "@econnessione/core/tests";
import { http } from "@econnessione/shared/io";
import { ImageArb, ProjectArb } from "@econnessione/shared/tests";
import { ProjectEntity } from "@entities/Project.entity";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";

describe("Edit Project ", () => {
  let appTest: AppTest, authorizationToken: string, project: ProjectEntity;

  beforeAll(async () => {
    appTest = await initAppTest();

    const [projectData] = fc.sample(ProjectArb, 1);
    await pipe(
      appTest.ctx.db.save(ProjectEntity, [
        {
          ...projectData,
        },
      ]),
      TE.map((projects) => {
        project = projects[0];
      })
    )();

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await appTest.ctx.db.close()();
  });

  test("Should return a 200", async () => {
    const updateData = {
      name: "new project name",
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
    const { updatedAt: _, ...expectedBody } = project;
    expect(receivedBody).toMatchObject({
      ...expectedBody,
      ...updateData,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate ? project.endDate.toISOString() : undefined,
      createdAt: project.createdAt.toISOString(),
    });

    expect(response.body.data.images.length).toEqual(project.images.length);
    project.name = response.body.data.name;
  });

  test("Should update images and return 200", async () => {
    const updateData = {
      images: fc.sample(ImageArb, 5).map(({ id, ...i }) => ({
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
    const { updatedAt: _, ...expectedBody } = project;
    expect(receivedBody).toMatchObject({
      ...expectedBody,
      startDate: project.startDate.toISOString(),
      endDate: project.endDate ? project.endDate.toISOString() : undefined,
      createdAt: project.createdAt.toISOString(),
      ...updateData,
    });

    expect(response.body.data.images.length).toEqual(
      project.images.length + updateData.images.length
    );
  });
});
