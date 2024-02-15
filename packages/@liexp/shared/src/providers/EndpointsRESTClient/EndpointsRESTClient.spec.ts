import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { TestEndpoints } from "../../../test/TestEndpoints";
import { type APIRESTClient } from "../api-rest.provider.js";
import { fromEndpoints } from "./EndpointsRESTClient.js";

describe("EndpointsRESTClient", () => {
  const apiRESTClient = mock<APIRESTClient>();
  const apiClient = fromEndpoints(apiRESTClient)(TestEndpoints);
  it("should be defined", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.Endpoints.Actor.get).toBeDefined();
    expect(apiClient.Endpoints.Actor.getList).toBeDefined();
    expect(apiClient.Endpoints.Actor.Custom.GetSiblings).toBeDefined();
  });
});
