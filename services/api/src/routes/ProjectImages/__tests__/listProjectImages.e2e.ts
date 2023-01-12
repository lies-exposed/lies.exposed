import { http } from "@liexp/shared/io";
import { MediaArb, ProjectArb } from "@liexp/shared/tests";
import { throwTE } from "@liexp/shared/utils/task.utils";
import { fc } from "@liexp/test";
import * as t from "io-ts";
import jwt from "jsonwebtoken";
import { MediaEntity } from "@entities/Media.entity";
import { ProjectEntity } from "@entities/Project.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { AppTest, GetAppTest } from "../../../../test/AppTest";

describe("List Project Images", () => {
  let appTest: AppTest;
  const media = fc.sample(MediaArb, 5);
  const [projectData] = fc.sample(ProjectArb, 1);
  let projects: ProjectEntity[];
  let projectImages: ProjectImageEntity[];
  let authorizationToken: string;

  beforeAll(async () => {
    appTest = GetAppTest();

    await throwTE(appTest.ctx.db.save(MediaEntity, media as any[]));
    projects = await throwTE(
      appTest.ctx.db.save(ProjectEntity, [
        {
          ...projectData,
          areas: projectData.areas.map((a) => ({
            ...a,
            media: a.media.map((m) => ({ id: m })),
          })),
        },
      ])
    );

    projectImages = await throwTE(
      appTest.ctx.db.save(
        ProjectImageEntity,
        media.map((i) => ({
          image: i,
          kind: http.ProjectImage.THEORY_KIND.value,
          project: projects[0],
        })) as any[]
      )
    );

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await throwTE(
      appTest.ctx.db.delete(
        ProjectImageEntity,
        projectImages.map((pd) => pd.id)
      )
    );

    await throwTE(
      appTest.ctx.db.delete(
        ProjectEntity,
        projects.map((p) => p.id)
      )
    );

    await throwTE(
      appTest.ctx.db.delete(
        MediaEntity,
        media.map((m) => m.id)
      )
    );

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
