import { type EndpointsMapType } from "@ts-endpoint/core";

type Endpoints<ES extends EndpointsMapType> = {
  [K in keyof ES]: ES[K];
};

const Endpoints = <ES extends EndpointsMapType>(es: ES): Endpoints<ES> => es;

export { Endpoints };
