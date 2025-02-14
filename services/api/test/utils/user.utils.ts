import type supertest from "supertest";
import type TestAgent from 'supertest/lib/agent.js';

export const loginUser =
  (ctx: { req: TestAgent<supertest.Test> }) =>
  async ({
    username,
    password,
  }: {
    username: string;
    password: string;
  }): Promise<{ token: string; authorization: string }> => {
    const response = await ctx.req
      .post("/v1/users/login")
      .send({ username, password })
      .expect(201);

    const token = response.body.data.token;

    return { token, authorization: `Bearer ${token}` };
  };