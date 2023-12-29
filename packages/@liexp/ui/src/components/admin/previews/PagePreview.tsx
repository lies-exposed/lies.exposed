import { http } from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import { PageContentBox } from "../../../containers/PageContentBox";
import { ECOTheme } from "../../../theme";
import { HelmetProvider } from "../../SEO";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout";
import { ThemeProvider } from "../../mui";

const PagePreview: React.FC = () => {
  const { record } = useEditContext();

  const qc = React.useMemo(() => new QueryClient(), []);

  const result = React.useMemo(
    () =>
      http.Page.Page.decode({
        ...(record ?? {}),
      }),
    [record],
  );

  if (!record) {
    return <LoadingIndicator />;
  }

  return pipe(
    result,
    E.fold(ValidationErrorsLayout, (p) => (
      <HelmetProvider>
        <ThemeProvider theme={ECOTheme}>
          <QueryClientProvider client={qc}>
            <PageContentBox {...p} />
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    )),
  );
};

export default PagePreview;
