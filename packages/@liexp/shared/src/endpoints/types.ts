import {
  type TypeOfEndpointInstance,
  type MinimalEndpointInstance,
} from "ts-endpoint";

export interface ResourceEndpoints<
  G extends MinimalEndpointInstance,
  L extends MinimalEndpointInstance,
  C extends MinimalEndpointInstance,
  E extends MinimalEndpointInstance,
  D extends MinimalEndpointInstance,
  CC extends Record<string, MinimalEndpointInstance>,
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
  G extends MinimalEndpointInstance,
  L extends MinimalEndpointInstance,
  C extends MinimalEndpointInstance,
  E extends MinimalEndpointInstance,
  D extends MinimalEndpointInstance,
  CC extends Record<string, MinimalEndpointInstance>,
>(endpoints: {
  Get: G;
  List: L;
  Create: C;
  Edit: E;
  Delete: D;
  Custom: CC;
}): ResourceEndpoints<G, L, C, E, D, CC> => endpoints;

export interface ResourceEndpointsTypeOf<
  R extends ResourceEndpoints<
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    MinimalEndpointInstance,
    Record<string, MinimalEndpointInstance>
  >,
> {
  Get: TypeOfEndpointInstance<R["Get"]>;
  List: TypeOfEndpointInstance<R["List"]>;
  Create: TypeOfEndpointInstance<R["Create"]>;
  Edit: TypeOfEndpointInstance<R["Edit"]>;
  Delete: TypeOfEndpointInstance<R["Delete"]>;
  Custom: R["Custom"] extends Record<string, MinimalEndpointInstance>
    ? {
        [K in keyof R["Custom"]]: TypeOfEndpointInstance<R["Custom"][K]>;
      }
    : never;
}
