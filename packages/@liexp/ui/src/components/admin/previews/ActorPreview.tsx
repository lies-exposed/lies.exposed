import { http } from "@liexp/shared/lib/io/index.js";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { ActorTemplate } from "../../../templates/ActorTemplate.js";
import { ECOTheme } from "../../../theme/index.js";
import { HelmetProvider } from "../../SEO.js";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout.js";
import { ThemeProvider } from "../../mui/index.js";

const ActorPreview: React.FC = () => {
  const { record } = useEditContext();
  const qc = useQueryClient();

  const result = React.useMemo(
    () =>
      Schema.decodeUnknownEither(http.Actor.Actor)({
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
            <ActorTemplate
              actor={a}
              query={{ hash: "actor-preview" }}
              onQueryChange={() => undefined}
              tab={0}
              onTabChange={() => undefined}
              onGroupClick={() => {}}
              onActorClick={() => {}}
              onEventClick={() => {}}
              onKeywordClick={() => undefined}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    )),
  );
};

export default ActorPreview;
