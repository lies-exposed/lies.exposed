import { Layout } from "@econnessione/ui/components/Layout";
import { MainContent } from "@econnessione/ui/components/MainContent";
import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as React from "react";

export const ValidationErrorsLayout = (errs: t.Errors): JSX.Element => {
  // eslint-disable-next-line no-console
  return (
    <Layout>
      <MainContent>
        {PathReporter.report(E.left(errs)).map((c, i) => (
          <div key={i}>{c}</div>
        ))}
      </MainContent>
    </Layout>
  );
};
