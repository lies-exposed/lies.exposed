import { http } from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import { ECOTheme } from "../../../theme";
import { AreaPageContent } from "../../AreaPageContent";
import { HelmetProvider } from "../../SEO";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout";
import { ThemeProvider } from "../../mui";

const AreaPreview: React.FC = () => {
  const { record } = useEditContext();

  const qc = React.useMemo(() => new QueryClient(), []);

  const result = React.useMemo(
    () =>
      http.Area.Area.decode({
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
            <React.Suspense>
              <AreaPageContent area={p} onGroupClick={() => undefined} />
            </React.Suspense>
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    )),
  );
};

export default AreaPreview;
