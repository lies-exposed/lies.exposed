import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type EndpointsQueryProvider } from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import {
  type QueryObserverSuccessResult,
  type UseQueryResult,
} from "@tanstack/react-query";
import * as React from "react";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";
import { ErrorBox } from "./Common/ErrorBox.js";
import { FullSizeLoader } from "./Common/FullSizeLoader.js";
import { Loader } from "./Common/Loader.js";

type QueriesRecord = Record<string, UseQueryResult<any, APIError>>;
type QueriesProp =
  | QueriesRecord
  | ((qq: EndpointsQueryProvider["Queries"]) => QueriesRecord);

type RenderFnData<Q extends QueriesProp> = Q extends QueriesRecord
  ? {
      [K in keyof Q]: Q[K] extends UseQueryResult<infer A, APIError>
        ? NonNullable<QueryObserverSuccessResult<A, APIError>["data"]>
        : never;
    }
  : Q extends (...args: any[]) => QueriesRecord
    ? {
        [K in keyof ReturnType<Q>]: ReturnType<Q>[K] extends UseQueryResult<
          infer A,
          APIError
        >
          ? NonNullable<QueryObserverSuccessResult<A, APIError>["data"]>
          : never;
      }
    : never;

type RenderFn<Q extends QueriesProp> = (data: RenderFnData<Q>) => JSX.Element;

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
  const initialErrors: Record<string, APIError> = {};
  const endpointsQueryProvider = useEndpointQueries();
  const queriesObject =
    typeof queries === "function"
      ? queries(endpointsQueryProvider.Queries)
      : queries;

  const { isLoading, isError, data, errors } = Object.entries(
    queriesObject,
  ).reduce(
    (acc, [key, value]: [string, UseQueryResult<any, APIError>]) => {
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

  if (isError) {
    return (
      <div>
        {Object.values(errors).map((err, i) => (
          <ErrorBox error={err} key={i} resetErrorBoundary={() => undefined} />
        ))}
      </div>
    );
  }

  if (props.debug) {
    return <div />;
  }

  return props.render(data);
};

export default QueriesRenderer;
