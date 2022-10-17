import { http } from "@liexp/shared/io";
import { ActorPageContent } from "@liexp/ui/components/ActorPageContent";
import { HelmetProvider } from "@liexp/ui/components/SEO";
import { ValidationErrorsLayout } from "@liexp/ui/components/ValidationErrorsLayout";
import { ThemeProvider } from "@liexp/ui/components/mui";
import { ECOTheme } from "@liexp/ui/theme";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";

const ActorPreview: React.FC = () => {
  const { record } = useEditContext();

  const qc = React.useMemo(() => new QueryClient(), []);

  const result = React.useMemo(
    () =>
      http.Actor.Actor.decode({
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
            <ActorPageContent
              actor={a}
              groups={[]}
              onGroupClick={() => {}}
              onActorClick={() => {}}
              hierarchicalGraph={{
                onNodeClick(n) {},
                onLinkClick(l) {},
              }}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    ))
  );
};

export default ActorPreview;
