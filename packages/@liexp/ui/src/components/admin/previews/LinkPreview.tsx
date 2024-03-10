import { http } from "@liexp/shared/lib/io/index.js";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { LoadingIndicator } from "react-admin";
import { ECOTheme } from "../../../theme/index.js";
import LinkCard from "../../Cards/LinkCard.js";
import { HelmetProvider } from "../../SEO.js";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout.js";
import { ThemeProvider } from "../../mui/index.js";

const LinkPreview: React.FC<{ record: any }> = ({ record }) => {
  // const { record } = useEditContext();
  const qc = useQueryClient();

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
