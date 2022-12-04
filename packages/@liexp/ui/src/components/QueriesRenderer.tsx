import { APIError } from "@liexp/shared/providers/http/api.provider";
import * as React from "react";
import { QueryObserverSuccessResult, UseQueryResult } from "react-query";
import { ErrorBox } from "./Common/ErrorBox";
import { FullSizeLoader } from "./Common/FullSizeLoader";
import { Loader } from "./Common/Loader";

interface QueriesRendererProps<
  Q extends { [key: string]: UseQueryResult<any, APIError> }
> {
  loader?: "fullsize" | "default";
  queries: Q;
  render: (data: {
    [K in keyof Q]: QueryObserverSuccessResult<
      Q[K] extends UseQueryResult<infer A, APIError> ? A : never,
      APIError
    >["data"];
  }) => JSX.Element;
}

const QueriesRenderer = <
  Q extends { [key: string]: UseQueryResult<any, APIError> }
>({
  queries,
  loader = "default",
  ...props
}: QueriesRendererProps<Q>): JSX.Element => {
  const { isLoading, isError, data } = Object.entries(queries).reduce(
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
      };
    },
    {
      isLoading: false,
      isError: false,
      data: {},
    }
  );

  // console.log("query render", { isLoading, data });

  if (isLoading) {
    if (loader === "default") {
      return <Loader key="loader" />;
    }
    return <FullSizeLoader key="full-size-loader" />;
  }

  if (isError) {
    return <ErrorBox />;
  }

  return props.render(data as any);
};

export default QueriesRenderer;
