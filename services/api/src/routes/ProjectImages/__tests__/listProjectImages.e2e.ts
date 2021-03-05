import { fc } from "@econnessione/core/tests";
import { getImageArb, getProjectArb } from "@econnessione/shared/tests";
import supertest from "supertest";
import { makeApp, makeContext } from "../../../server";
import { pipe } from "fp-ts/lib/pipeable";
import * as TE from "fp-ts/lib/TaskEither";
import { RouteContext } from "@routes/route.types";
import jwt from "jsonwebtoken";
import { http } from "@econnessione/shared/io";
import * as t from "io-ts";
import { ProjectEntity } from "@entities/Project.entity";
import { ImageEntity } from "@entities/Image.entity";
import { ProjectImageEntity } from "@entities/ProjectImage.entity";
import { sequenceS } from "fp-ts/lib/Apply";
// import { uuid } from "@econnessione/shared/utils/uuid";

describe("List Project Images", () => {
  let ctx: RouteContext,
    req: supertest.SuperTest<supertest.Test>,
    authorizationToken: string,
    project: ProjectEntity;

  beforeAll(async () => {
    await pipe(
      makeContext(process.env),
      TE.chain((ctx) => {
        ctx = ctx;
        authorizationToken = `Bearer ${jwt.sign(
          { id: "1" },
          ctx.env.JWT_SECRET
        )}`;

        const images = fc.sample(getImageArb(), 5);
        const [projectData] = fc.sample(getProjectArb(), 1);

        return pipe(
          sequenceS(TE.taskEither)({
            images: ctx.db.save(ImageEntity, images),
            projects: ctx.db.save(ProjectEntity, [
              {
                ...projectData,
              },
            ]),
          }),
          TE.chainFirst(({ images, projects }) =>
            ctx.db.save(
              ProjectImageEntity,
              images.map((i) => ({
                image: i,
                kind: http.ProjectImage.THEORY_KIND.value,
                project: projects[0],
              }))
            )
          ),
          TE.map(({ projects }) => {
            project = projects[0];
            return makeApp(ctx);
          })
        );
      }),
      TE.map((app) => {
        req = supertest(app);
      })
    )();
  });

  afterAll(async () => {
    await ctx.db.close()();
  });

  test("Should return a 200", async () => {
    const response = await req
      .get(`/v1/projects/${project.id}/images`)
      .set("Authorization", authorizationToken);

    expect(response.status).toEqual(200);
    console.log(response.body);
    expect(
      t.array(http.ProjectImage.ProjectImage).decode(response.body.data)._tag
    ).toEqual("Right");
  });
});
