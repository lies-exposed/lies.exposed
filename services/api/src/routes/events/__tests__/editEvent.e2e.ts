import { fc } from "@econnessione/core/tests";
import * as http from "@econnessione/shared/io/http";
import { EventArb, ImageArb } from "@econnessione/shared/tests";
import jwt from "jsonwebtoken";
import { AppTest, initAppTest } from "../../../../test/AppTest";
import { EventEntity } from "../../../entities/Event.entity";

describe("Edit Event", () => {
  let appTest: AppTest,
    authorizationToken: string,
    event: http.Events.Uncategorized.Uncategorized;

  beforeAll(async () => {
    appTest = await initAppTest();

    const eventData = fc.sample(
      EventArb.map((e) => ({
        ...e,
        images: [],
        links: [],
        topics: [],
        groups: [],
        actors: [],
        groupsMembers: [],
      })),
      1
    );
    const result = await appTest.ctx.db.save(EventEntity, eventData as any[])();

    event = (result as any).right[0];
    authorizationToken = `Bearer ${jwt.sign(
      { id: "1" },
      appTest.ctx.env.JWT_SECRET
    )}`;
  });

  afterAll(async () => {
    await appTest.ctx.db.close()();
  });

  test("Should edit the event", async () => {
    const eventData = {
      title: "First event",
      startDate: new Date().toISOString(),
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(
      http.Events.Uncategorized.Uncategorized.decode(response.body.data)._tag
    ).toEqual("Right");

    expect(body).toMatchObject({
      ...event,
      ...eventData,
      endDate: event.endDate ? event.endDate.toISOString() : undefined,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });
  });

  test("Should add images to the event", async () => {
    const images = fc
      .sample(ImageArb, 5)
      .map(({ id, createdAt, updatedAt, ...image }) => image);

    const eventData = {
      title: "First event",
      startDate: new Date().toISOString(),
      images,
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(
      http.Events.Uncategorized.Uncategorized.decode(response.body.data)._tag
    ).toEqual("Right");

    expect(body).toMatchObject({
      ...event,
      ...eventData,
      endDate: event.endDate ? event.endDate.toISOString() : undefined,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });
  });

  test("Should edit event links", async () => {
    const eventData = {
      title: "Event with links",
      startDate: new Date().toISOString(),
      links: [],
      images: [],
    };
    const response = await appTest.req
      .put(`/v1/events/${event.id}`)
      .set("Authorization", authorizationToken)
      .send(eventData);

    const body = response.body.data;

    expect(response.status).toEqual(200);

    expect(body).toMatchObject({
      ...(event as any),
      ...eventData,
      endDate: event.endDate ? event.endDate.toISOString() : undefined,
      createdAt: event.createdAt.toISOString(),
      updatedAt: body.updatedAt,
    });
  });
});
