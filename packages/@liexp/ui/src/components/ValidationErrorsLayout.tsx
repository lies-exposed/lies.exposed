import type * as t from "io-ts";
import { failure } from "io-ts/PathReporter";
import * as React from "react";

import { Layout } from "./Layout.js";
import { MainContent } from "./MainContent.js";

export const ValidationErrorsLayout: React.FC<t.Errors> = (errs) => {
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
