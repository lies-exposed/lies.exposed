import { http } from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { LoadingIndicator } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import { ECOTheme } from "../../../theme";
import LinkCard from "../../Cards/LinkCard";
import { HelmetProvider } from "../../SEO";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout";
import { ThemeProvider } from "../../mui";

const LinkPreview: React.FC<{ record: any }> = ({ record }) => {
  // const { record } = useEditContext();

  const qc = React.useMemo(() => new QueryClient(), []);

  const result = React.useMemo(
    () =>
      http.Link.Link.decode({
        ...(record ?? {}),
      }),
    [record],
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
    )),
  );
};

export default LinkPreview;
