import { describe, expect, it } from "vitest";
import { mock } from "vitest-mock-extended";
import { TestEndpoints } from "../../../test/TestEndpoints";
import { type APIRESTClient } from '../../http';
import { fromEndpoints } from "./EndpointsRESTClient";

describe("EndpointsRESTClient", () => {
  const apiRESTClient = mock<APIRESTClient>();
  const apiClient = fromEndpoints(apiRESTClient)(TestEndpoints);
  it("should be defined", () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.Actor.get).toBeDefined()
    expect(apiClient.Actor.getList).toBeDefined()
    expect(apiClient.Actor.Custom.GetSiblings).toBeDefined()
  });
});
