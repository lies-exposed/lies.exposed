import { fc } from "@liexp/test";
import { parseISO } from "date-fns";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type MockProxy } from "vitest-mock-extended";
import { TestEndpoints, overrides } from "../../../test/TestEndpoints";
import { ActorArb } from "../../tests";
import { fromEndpoints } from "../EndpointsRESTClient/EndpointsRESTClient";
import { type APIRESTClient } from "../api-rest.provider";
import { CreateQueryProvider } from "./index";

const apiProviderMock: MockProxy<APIRESTClient> = vi.hoisted(() => {
  return {
    get: vi.fn().mockRejectedValue("'get' not mocked"),
    getList: vi.fn().mockRejectedValue("'getList' not mocked"),
    request: vi.fn().mockRejectedValue("'request' not mocked"),
  } as any;
});
vi.mock("../../client/api", () => ({ apiProvider: apiProviderMock }));

describe("EndpointQueriesProvider", () => {
  const queries = fromEndpoints(apiProviderMock)(TestEndpoints);
  const Q = CreateQueryProvider(queries, overrides);

  afterEach(() => {
    apiProviderMock.get.mockReset();
    apiProviderMock.getList.mockReset();
    apiProviderMock.request.mockReset();
  });

  it("should be defined", () => {
    expect(Q).toBeTruthy();
  });

  it("should have Actor get", async () => {
    const [actorData] = fc.sample(ActorArb, 1).map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
    apiProviderMock.get.mockResolvedValue({ data: actorData });

    expect(Q.Actor.get).toBeTruthy();
    const params = { id: "1" };
    const actorKey = Q.Actor.get.getKey(params);
    expect(actorKey).toEqual(["Actor", params, undefined, false]);
    const actor = await Q.Actor.get.fetch(params, undefined);

    expect(apiProviderMock.get).toHaveBeenCalledWith("/actors/1", {
      id: "1",
    });

    expect(actor).toMatchObject({
      ...actorData,
      bornOn: actorData.bornOn ? new Date(actorData.bornOn) : undefined,
      updatedAt: parseISO(actorData.updatedAt),
      createdAt: parseISO(actorData.createdAt),
    });
  });

  it("should have Actor getList", async () => {
    const actorData = fc.sample(ActorArb, 1).map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));
    apiProviderMock.getList.mockResolvedValue({ data: actorData, total: 2 });

    expect(Q.Actor.list).toBeDefined();
    const params = {
      pagination: { perPage: 1, page: 1 },
      filter: { ids: ["1"] },
    };
    const actorKey = Q.Actor.list.getKey(params);
    expect(actorKey).toEqual(["Actor", params, undefined, false]);
    const actor = await Q.Actor.list.fetch(params);

    expect(apiProviderMock.getList).toHaveBeenCalledWith("/actors", {
      filter: {
        ids: ["1"],
      },
      pagination: {
        perPage: 1,
        page: 1,
      },
    });
    expect(actor).toMatchObject({
      data: actorData.map((a) => ({
        ...a,
        bornOn: a.bornOn ? new Date(a.bornOn) : undefined,
        updatedAt: parseISO(a.updatedAt),
        createdAt: parseISO(a.createdAt),
      })),
      total: 2,
    });
  });

  it("should have Actor Custom Query", async () => {
    const actorData = fc.sample(ActorArb, 1).map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));

    apiProviderMock.request.mockResolvedValue({ data: actorData });

    expect(Q.Actor.Custom).toBeDefined();

    const actorParams = { id: "1" };
    const actorKey = Q.Actor.Custom.GetSiblings.getKey(actorParams);
    expect(actorKey).toEqual([
      "Actor-GetSiblings",
      actorParams,
      undefined,
      false,
    ]);
    const actor = await Q.Actor.Custom.GetSiblings.fetch(actorParams);

    expect(apiProviderMock.request).toHaveBeenCalledWith({
      data: undefined,
      params: undefined,
      method: "GET",
      url: "/actors/1/siblings",
      responseType: "json",
      headers: {
        Accept: "application/json",
      },
    });
    expect(actor).toMatchObject({
      data: actorData.map((a) => ({
        ...a,
        bornOn: a.bornOn ? new Date(a.bornOn) : undefined,
        updatedAt: parseISO(a.updatedAt),
        createdAt: parseISO(a.createdAt),
      })),
    });
  });

  it("should have Actor Custom Query Override", async () => {
    const actorData = fc.sample(ActorArb, 1).map((a) => ({
      ...a,
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    }));

    apiProviderMock.getList.mockResolvedValue({ data: actorData, total: 1 });

    expect(Q.Actor.Custom).toBeDefined();

    const actorParams = { id: "1" };
    const actorKey = Q.Actor.Custom.GetSiblingsOverride.getKey(actorParams);
    expect(actorKey).toEqual([
      "Actor-GetSiblingsOverride",
      actorParams,
      undefined,
      false,
    ]);

    const actor = await Q.Actor.Custom.GetSiblingsOverride.fetch(actorParams);

    expect(apiProviderMock.getList).toHaveBeenCalledWith("/actors", {
      filter: {
        ids: ["1"],
      },
      pagination: {
        perPage: 10,
        page: 1,
      },
      sort: {
        field: "createdAt",
        order: "ASC",
      },
    });
    expect(actor).toMatchObject({
      data: actorData.map((a) => ({
        ...a,
        bornOn: a.bornOn ? new Date(a.bornOn) : undefined,
        updatedAt: parseISO(a.updatedAt),
        createdAt: parseISO(a.createdAt),
      })),
    });
  });
});
