import { type ParseError } from "effect/ParseResult";
import * as React from "react";
import { Layout } from "./Layout.js";
import { MainContent } from "./MainContent.js";
import { Typography } from "./mui/index.js";

export const ValidationErrorsLayout: React.FC<ParseError> = (errs) => {
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
        <Typography>{errs.message}</Typography>
        <code>{JSON.stringify(errs.issue, null, 2)}</code>
      </MainContent>
    </Layout>
  );
};
