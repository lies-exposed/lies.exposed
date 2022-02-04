import { fc } from "@econnessione/core/tests";
import { http } from "@econnessione/shared/io";
import { MediaArb, ProjectArb } from "@econnessione/shared/tests";
import * as t from "io-ts";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { MediaEntity } from "@entities/Media.entity";
import { ProjectEntity } from "@entities/Project.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";

describe("List Project Images", () => {
  let appTest: AppTest;
  const media = fc.sample(MediaArb, 5);
  const [projectData] = fc.sample(ProjectArb, 1);
  let projects: ProjectEntity[];
  let projectImages: ProjectImageEntity[];
  let authorizationToken: string;

  beforeAll(async () => {
    appTest = await initAppTest();

    await appTest.ctx.db.save(MediaEntity, media as any[])();
    projects = (
      (await appTest.ctx.db.save(ProjectEntity, [
        {
          ...projectData,
        },
      ])()) as any
    ).right;

    projectImages = (
      (await appTest.ctx.db.save(
        ProjectImageEntity,
        media.map((i) => ({
          image: i,
          kind: http.ProjectImage.THEORY_KIND.value,
          project: projects[0],
        })) as any[]
      )()) as any
    ).right;

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await appTest.ctx.db.delete(
      ProjectImageEntity,
      projectImages.map((pd) => pd.id)
    )();
    await appTest.ctx.db.delete(
      ProjectEntity,
      projects.map((p) => p.id)
    )();

    await appTest.ctx.db.delete(
      MediaEntity,
      media.map((m) => m.id)
    )();
    await appTest.ctx.db.close()();
  });

  test("Should return a 200", async () => {
    const response = await appTest.req
      .get(`/v1/project/images`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);

    expect(
      t.array(http.ProjectImage.ProjectImage).decode(response.body.data)._tag
    ).toEqual("Right");
  });
});
