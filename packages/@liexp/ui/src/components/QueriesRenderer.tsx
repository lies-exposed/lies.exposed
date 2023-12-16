import { type APIError } from "@liexp/shared/lib/io/http/Error/APIError";
import * as React from "react";
import {
  type QueryObserverSuccessResult,
  type UseQueryResult,
} from "react-query";
import { ErrorBox } from "./Common/ErrorBox";
import { FullSizeLoader } from "./Common/FullSizeLoader";
import { Loader } from "./Common/Loader";

interface QueriesRendererProps<
  Q extends Record<string, UseQueryResult<any, APIError>>,
> {
  loader?: "fullsize" | "default";
  queries: Q;
  debug?: boolean;
  render: (data: {
    [K in keyof Q]: QueryObserverSuccessResult<
      Q[K] extends UseQueryResult<infer A, APIError> ? A : never,
      APIError
    >["data"];
  }) => JSX.Element;
}

const QueriesRenderer = <
  Q extends Record<string, UseQueryResult<any, APIError>>,
>({
  queries,
  loader = "default",
  ...props
}: QueriesRendererProps<Q>): JSX.Element => {
  const initialErrors: Record<string, APIError> = {};
  const { isLoading, isError, data, errors } = Object.entries(queries).reduce(
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
