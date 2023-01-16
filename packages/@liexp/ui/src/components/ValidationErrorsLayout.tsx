// import * as E from "fp-ts/Either";
import * as t from "io-ts";
import { failure } from "io-ts/lib/PathReporter";
import * as React from "react";

import { Layout } from "./Layout";
import { MainContent } from "./MainContent";

export const ValidationErrorsLayout = (errs: t.Errors): JSX.Element => {
  return (
    <Layout
      header={{
        pathname: "",
        onTitleClick: () => undefined,
        onMenuItemClick: () => undefined,
        menu: [],
      }}
    >
      <MainContent>
        {failure(errs).map((c, i) => (
          <div key={i}>{c}</div>
        ))}
      </MainContent>
    </Layout>
  );
};
