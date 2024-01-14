import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError.js";
import { type EndpointsQueryProvider } from "@liexp/shared/lib/providers/EndpointQueriesProvider/index.js";
import * as React from "react";
import {
  type QueryObserverSuccessResult,
  type UseQueryResult,
} from "react-query";
import { useEndpointQueries } from "../hooks/useEndpointQueriesProvider.js";
import { ErrorBox } from "./Common/ErrorBox.js";
import { FullSizeLoader } from "./Common/FullSizeLoader.js";
import { Loader } from "./Common/Loader.js";

type QueriesRecord = Record<string, UseQueryResult<any, APIError>>;
type QueriesProp =
  | QueriesRecord
  | ((qq: EndpointsQueryProvider) => QueriesRecord);

type RenderFn<Q extends QueriesProp> = (
  data: Q extends QueriesRecord
    ? {
        [K in keyof Q]: QueryObserverSuccessResult<
          Q[K] extends UseQueryResult<infer A, APIError> ? A : never,
          APIError
        >["data"];
      }
    : Q extends (...args: any[]) => QueriesRecord
      ? {
          [K in keyof ReturnType<Q>]: QueryObserverSuccessResult<
            ReturnType<Q>[K] extends UseQueryResult<infer A, APIError>
              ? A
              : never,
            APIError
          >["data"];
        }
      : never,
) => JSX.Element;

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
}: QueriesRendererProps<Q>): JSX.Element => {
  const initialErrors: Record<string, APIError> = {};
  const endpointsQueryProvider = useEndpointQueries();
  const queriesObject =
    typeof queries === "function" ? queries(endpointsQueryProvider) : queries;
  const { isLoading, isError, data, errors } = Object.entries(
    queriesObject,
  ).reduce(
    (acc, [key, value]) => {
      // if (!value.isSuccess) {
      //   // eslint-disable-next-line no-console
      //   console.log(`query ${key}`, value);
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
      data: {},
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

  return props.render(data as any);
};

export default QueriesRenderer;
