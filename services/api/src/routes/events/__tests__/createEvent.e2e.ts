import * as http from "@econnessione/shared/io/http";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";

describe("Create Event", () => {
  let appTest: AppTest, authorizationToken: string;

  beforeAll(async () => {
    appTest = await initAppTest();

    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await appTest.ctx.db.close()();
  });

  test("Should create an event", async () => {
    const eventData: http.Events.Uncategorized.CreateEventBody = {
      title: "First event",
      images: undefined as any,
      actors: undefined,
      groups: undefined,
      groupMembers: undefined,
      startDate: new Date(),
      endDate: undefined as any,
      body: "My first event",
    } as any;
    const response = await appTest.req
      .post(`/v1/events`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;
    const decodedBody = http.Events.Uncategorized.Uncategorized.decode(body);

    expect(response.status).toEqual(201);

    expect(decodedBody._tag).toEqual("Right");
  });

  test.todo("Should create an event with images");
  test.todo("Should create an event with groups");
  test.todo("Should create an event with actors");
  test.todo("Should create an event with group members");
});
