import { http } from "@liexp/shared/io";
import LinkCard from "@liexp/ui/components/Cards/LinkCard";
import { HelmetProvider } from "@liexp/ui/components/SEO";
import { ValidationErrorsLayout } from "@liexp/ui/components/ValidationErrorsLayout";
import { ThemeProvider } from "@liexp/ui/components/mui";
import { ECOTheme } from "@liexp/ui/theme";
import * as E from "fp-ts/lib/Either";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";

const LinkPreview: React.FC = () => {
  const { record } = useEditContext();

  const qc = React.useMemo(() => new QueryClient(), []);

  const result = React.useMemo(
    () =>
      http.Link.Link.decode({
        ...(record ?? {}),
      }),
    [record]
  );

  if (!record) {
    return <LoadingIndicator />;
  }

  return pipe(
    result,
    E.fold(ValidationErrorsLayout, (a) => (
      <HelmetProvider>
        <QueryClientProvider client={qc}>
          <ThemeProvider theme={ECOTheme}>
            <LinkCard link={{ ...a, selected: true }} onClick={() => {}} />
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    ))
  );
};

export default LinkPreview;
