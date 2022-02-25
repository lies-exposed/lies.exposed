import * as E from "fp-ts/lib/Either";
import * as t from "io-ts";
import { PathReporter } from "io-ts/lib/PathReporter";
import * as React from "react";
import { Layout } from "./Layout";
import { MainContent } from "./MainContent";

export const ValidationErrorsLayout = (errs: t.Errors): JSX.Element => {
  // eslint-disable-next-line no-console
  return (
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
  );
};
