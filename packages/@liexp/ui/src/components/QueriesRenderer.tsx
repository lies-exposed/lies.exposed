import { type Endpoints } from "@liexp/shared/lib/endpoints/api/index.js";
import { type QueryProviderCustomQueries } from "@liexp/shared/lib/providers/EndpointQueriesProvider/overrides.js";
import {
  type QueryObserverSuccessResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import { type IOError } from "@ts-endpoint/core";
import { type EndpointsQueryProvider } from "@ts-endpoint/tanstack-query";
import { type ParseError } from "effect/ParseResult";
import * as React from "react";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";
import { ErrorBox } from "./Common/ErrorBox.js";
import { FullSizeLoader } from "./Common/FullSizeLoader.js";
import { Loader } from "./Common/Loader.js";

type QueriesRecord = Record<string, UseQueryResult<any, IOError | ParseError>>;
type QueriesProp =
  | QueriesRecord
  | ((
      qq: EndpointsQueryProvider<Endpoints, QueryProviderCustomQueries>,
    ) => QueriesRecord);

type RenderFnData<Q extends QueriesProp> = Q extends QueriesRecord
  ? {
      [K in keyof Q]: Q[K] extends UseQueryResult<infer A, IOError | ParseError>
        ? NonNullable<QueryObserverSuccessResult<A, IOError>["data"]>
        : never;
    }
  : Q extends (...args: any[]) => QueriesRecord
    ? {
        [K in keyof ReturnType<Q>]: ReturnType<Q>[K] extends UseQueryResult<
          infer A,
          IOError | ParseError
        >
          ? NonNullable<
              QueryObserverSuccessResult<A, IOError | ParseError>["data"]
            >
          : never;
      }
    : never;

type RenderFn<Q extends QueriesProp> = (
  data: RenderFnData<Q>,
) => React.ReactElement;

interface QueriesRendererProps<Q extends QueriesProp> {
  loader?: "fullsize" | "default";
  queries: Q;
  debug?: boolean;
  render: RenderFn<Q>;
}

const QueriesRenderer = <Q extends QueriesProp>({
  queries,
  loader = "default",
  ...props
}: QueriesRendererProps<Q>): React.ReactNode => {
  const initialErrors: Record<string, IOError> = {};
  const endpointsQueryProvider = useEndpointQueries();
  const queriesObject =
    typeof queries === "function" ? queries(endpointsQueryProvider) : queries;

  const {
    isLoading,
    isError,
    data,
    errors: errorsMap,
  } = Object.entries(queriesObject).reduce(
    (acc, [key, value]: [string, UseQueryResult<any, IOError>]) => {
      // if (!value.isSuccess) {
      //   // eslint-disable-next-line no-console
      // console.log(`query ${key}`, value);
      // }

      return {
        isLoading: !acc.isLoading ? value.isLoading : acc.isLoading,
        isError: !acc.isError ? value.isError : acc.isError,
        data: value.data
          ? {
              ...acc.data,
              [key]: value.data,
            }
          : acc.data,
        errors: value.error
          ? {
              ...acc.errors,
              [key]: value.error,
            }
          : acc.errors,
      };
    },
    {
      isLoading: false,
      isError: false,
      errors: initialErrors,
      data: {} as RenderFnData<Q>,
    },
  );

  // console.log("query render", { isLoading, data });

  if (isLoading) {
    if (loader === "default") {
      return <Loader key="loader" />;
    }
    return <FullSizeLoader key="full-size-loader" />;
  }

  if (props.debug) {
    // eslint-disable-next-line no-console
    console.log("data", data);
    if (errorsMap && Object.keys(errorsMap).length > 0) {
      const errors = Object.values(errorsMap);
      // eslint-disable-next-line no-console
      errors.forEach((error) => console.error(error));
    }
    return <div />;
  }

  if (isError) {
    const errors = Object.values(errorsMap);
    // eslint-disable-next-line no-console
    errors.forEach((error) => console.error(error));
    return (
      <div>
        {errors.map((err, i) => (
          <ErrorBox error={err} key={i} resetErrorBoundary={() => undefined} />
        ))}
      </div>
    );
  }

  return props.render(data);
};

export default QueriesRenderer;
