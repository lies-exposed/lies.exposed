import { http } from "@liexp/shared/lib/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import { ActorTemplate } from "../../../templates/ActorTemplate";
import { ECOTheme } from "../../../theme";
import { HelmetProvider } from "../../SEO";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout";
import { ThemeProvider } from "../../mui";

const ActorPreview: React.FC = () => {
  const { record } = useEditContext();

  const qc = React.useMemo(() => new QueryClient(), []);

  const result = React.useMemo(
    () =>
      http.Actor.Actor.decode({
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
              query={{} as any}
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
