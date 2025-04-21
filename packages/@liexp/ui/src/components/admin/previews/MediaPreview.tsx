import { http } from "@liexp/shared/lib/io/index.js";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { ErrorBoundary } from "react-error-boundary";
import { ECOTheme } from "../../../theme/index.js";
import { ErrorBox } from "../../Common/ErrorBox.js";
import MediaElement from "../../Media/MediaElement.js";
import { HelmetProvider } from "../../SEO.js";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout.js";
import { ThemeProvider } from "../../mui/index.js";

const MediaPreview: React.FC = () => {
  const { record } = useEditContext();

  const qc = useQueryClient();

  const result = React.useMemo(
    () =>
      Schema.decodeUnknownEither(http.Media.Media)({
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
            <ErrorBoundary FallbackComponent={ErrorBox}>
              <MediaElement media={a} style={{ padding: 20, maxHeight: 500 }} />
            </ErrorBoundary>
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    )),
  );
};

export default MediaPreview;
