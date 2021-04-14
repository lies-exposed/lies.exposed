import { EndpointInstance } from "ts-endpoint";

export interface ResourceEndpoints<
  G extends EndpointInstance<any>,
  L extends EndpointInstance<any>,
  C extends EndpointInstance<any>,
  E extends EndpointInstance<any>,
  D extends EndpointInstance<any>
> {
  Get: G;
  List: L;
  Create: C;
  Edit: E;
  Delete: D;
}

export const ResourceEndpoints = <
  G extends EndpointInstance<any>,
  L extends EndpointInstance<any>,
  C extends EndpointInstance<any>,
  E extends EndpointInstance<any>,
  D extends EndpointInstance<any>
>(endpoints: {
  Get: G;
  List: L;
  Create: C;
  Edit: E;
  Delete: D;
}): ResourceEndpoints<G, L, C, E, D> => endpoints;
