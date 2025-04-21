import { MediaEntity } from "@liexp/backend/lib/entities/Media.entity.js";
import { ProjectEntity } from "@liexp/backend/lib/entities/Project.entity.js";
import { ProjectImageEntity } from "@liexp/backend/lib/entities/ProjectImage.entity.js";
import { http } from "@liexp/shared/lib/io/index.js";
import { throwTE } from "@liexp/shared/lib/utils/task.utils.js";
import { MediaArb } from "@liexp/test/lib/arbitrary/Media.arbitrary.js";
import { ProjectArb } from "@liexp/test/lib/arbitrary/Project.arbitrary.js";
import { Schema } from "effect";
import fc from "fast-check";
import jwt from "jsonwebtoken";
import { GetAppTest, type AppTest } from "../../../../test/AppTest.js";

describe("List Project Images", () => {
  let appTest: AppTest;
  const media = fc.sample(MediaArb, 5);
  const [projectData] = fc.sample(ProjectArb, 1);
  let projects: ProjectEntity[];
  let projectImages: ProjectImageEntity[];
  let authorizationToken: string;

  beforeAll(async () => {
    appTest = await GetAppTest();

    await throwTE(appTest.ctx.db.save(MediaEntity, media as any[]));
    projects = await throwTE(
      appTest.ctx.db.save(ProjectEntity, [
        {
          ...projectData,
          media: [],
          areas: projectData.areas.map((a) => ({
            ...a,
            featuredImage: null,
            deletedAt: null,
            events: [],
            socialPosts: [],
            media: a.media.map((m) => ({ id: m })),
          })),
        },
      ]),
    );

    projectImages = await throwTE(
      appTest.ctx.db.save(
        ProjectImageEntity,
        media.map((i) => ({
          image: {
            ...i,
            events: [],
            links: [],
            areas: [],
            keywords: [],
            socialPosts: [],
            featuredInAreas: [],
            featuredInStories: [],
          },
          kind: http.ProjectImage.THEORY_KIND.literals[0],
          project: projects[0],
        })),
      ),
    );

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET,
    )}`;
  });

  afterAll(async () => {
    await throwTE(
      appTest.ctx.db.delete(
        ProjectImageEntity,
        projectImages.map((pd) => pd.id),
      ),
    );

    await throwTE(
      appTest.ctx.db.delete(
        ProjectEntity,
        projects.map((p) => p.id),
      ),
    );

    await throwTE(
      appTest.ctx.db.delete(
        MediaEntity,
        media.map((m) => m.id),
      ),
    );
  });

  test("Should return a 200", async () => {
    const response = await appTest.req
      .get(`/v1/project/images`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);

    expect(
      Schema.decodeUnknownEither(Schema.Array(http.ProjectImage.ProjectImage))(
        response.body.data,
      )._tag,
    ).toEqual("Right");
  });
});
