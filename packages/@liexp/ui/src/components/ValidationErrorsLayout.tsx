import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Layout } from "./Layout";
import { MainContent } from "./MainContent";

export const ValidationErrorsLayout = (errs: t.Errors): JSX.Element => {

  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
      <Layout
        header={{
          onTitleClick: () => undefined,
          onMenuItemClick: () => undefined,
          menu: [],
        }}
      >
        <MainContent>
          {PathReporter.report(E.left(errs)).map((c, i) => (
            <div key={i}>{c}</div>
          ))}
        </MainContent>
      </Layout>
    </QueryClientProvider>
  );
};
