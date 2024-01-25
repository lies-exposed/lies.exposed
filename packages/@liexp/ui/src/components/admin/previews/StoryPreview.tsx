import { http } from "@liexp/shared/lib/io/index.js";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { ECOTheme } from "../../../theme/index.js";
import { HelmetProvider } from "../../SEO.js";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout.js";
import { ThemeProvider } from "../../mui/index.js";
import { StoryPageContent } from "../../stories/StoryPageContent.js";

const StoryPreview: React.FC = () => {
  const { record } = useEditContext();

  const qc = useQueryClient()

  const result = React.useMemo(
    () => pipe(http.Story.Story.decode({ ...record, links: [] })),
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
            <StoryPageContent
              story={p}
              onKeywordClick={() => {}}
              onActorClick={() => {}}
              onGroupClick={() => {}}
              onMediaClick={() => {}}
              onEventClick={() => {}}
            />
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    )),
  );
};

export default StoryPreview;
