import { MinimalEndpoint } from "ts-endpoint";

export interface ResourceEndpoints<
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  C extends MinimalEndpoint,
  E extends MinimalEndpoint,
  D extends MinimalEndpoint,
  CC extends { [key: string]: MinimalEndpoint }
> {
  Get: G;
  List: L;
  Create: C;
  Edit: E;
  Delete: D;
  Custom: {
    [CCK in keyof CC]: CC[CCK];
  };
}

export const ResourceEndpoints = <
  G extends MinimalEndpoint,
  L extends MinimalEndpoint,
  C extends MinimalEndpoint,
  E extends MinimalEndpoint,
  D extends MinimalEndpoint,
  CC extends { [key: string]: MinimalEndpoint }
>(endpoints: {
  Get: G;
  List: L;
  Create: C;
  Edit: E;
  Delete: D;
  Custom: CC;
}): ResourceEndpoints<G, L, C, E, D, CC> => endpoints;
