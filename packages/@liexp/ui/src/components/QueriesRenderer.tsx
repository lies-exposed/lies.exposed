import { APIError } from "@liexp/shared/providers/api.provider";
import * as React from "react";
import { QueryObserverSuccessResult, UseQueryResult } from "react-query";
import { ErrorBox } from "./Common/ErrorBox";
import { FullSizeLoader } from "./Common/FullSizeLoader";

interface QueriesRendererProps<
  Q extends { [key: string]: UseQueryResult<any, APIError> }
> {
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
>(
  props: QueriesRendererProps<Q>
): JSX.Element => {

  const { isLoading, isError, data } = Object.entries(props.queries).reduce(
    (acc, [key, value]) => ({
      isLoading: !acc.isLoading ? value.isLoading : acc.isLoading,
      isError: !acc.isError ? value.isError : acc.isError,
      data: value.data
        ? {
            ...acc.data,
            [key]: value.data,
          }
        : acc.data,
    }),
    {
      isLoading: false,
      isError: false,
      data: {},
    }
  );

  // console.log("query render", { isLoading, data });

  if (isLoading) {
    return <FullSizeLoader />;
  }

  if (isError) {
    return <ErrorBox />;
  }

  return props.render(data as any);
};

export default QueriesRenderer;
