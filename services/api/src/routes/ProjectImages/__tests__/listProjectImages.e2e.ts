import { fc } from "@econnessione/core/tests";
import { http } from "@econnessione/shared/io";
import { ImageArb, ProjectArb } from "@econnessione/shared/tests";
import { ImageEntity } from "@entities/Image.entity";
import { ProjectEntity } from "@entities/Project.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { sequenceS } from "fp-ts/lib/Apply";
import * as TE from "fp-ts/lib/TaskEither";
import { pipe } from "fp-ts/lib/pipeable";
import * as t from "io-ts";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";

describe("List Project Images", () => {
  let appTest: AppTest, authorizationToken: string;

  beforeAll(async () => {
    appTest = await initAppTest();
    const images = fc.sample(ImageArb, 5);
    const [projectData] = fc.sample(ProjectArb, 1);
    await pipe(
      sequenceS(TE.taskEither)({
        images: appTest.ctx.db.save(ImageEntity, images),
        projects: appTest.ctx.db.save(ProjectEntity, [
          {
            ...projectData,
          },
        ]),
      }),
      TE.chainFirst(({ images, projects }) =>
        appTest.ctx.db.save(
          ProjectImageEntity,
          images.map((i) => ({
            image: i,
            kind: http.ProjectImage.THEORY_KIND.value,
            project: projects[0],
          }))
        )
      )
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
    const response = await appTest.req
      .get(`/v1/project/images`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);

    expect(
      t.array(http.ProjectImage.ProjectImage).decode(response.body.data)._tag
    ).toEqual("Right");
  });
});
