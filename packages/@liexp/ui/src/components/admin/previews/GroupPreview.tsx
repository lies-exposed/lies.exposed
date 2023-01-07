import { http } from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import { GroupTemplate } from "../../../templates/GroupTemplate";
import { ECOTheme } from "../../../theme";
import { HelmetProvider } from "../../SEO";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout";
import { ThemeProvider } from "../../mui";

const GroupPreview: React.FC = () => {
  const { record } = useEditContext();

  const qc = React.useMemo(() => new QueryClient(), []);

  const result = React.useMemo(
    () =>
      http.Group.Group.decode({
        ...(record ?? {}),
      }),
    [record]
  );

  const [tab, setTab] = React.useState(0);

  if (!record) {
    return <LoadingIndicator />;
  }

  return pipe(
    result,
    E.fold(ValidationErrorsLayout, (p) => (
      <HelmetProvider>
        <QueryClientProvider client={qc}>
          <ThemeProvider theme={ECOTheme}>
            <GroupTemplate
              group={p}
              tab={tab}
              onTabChange={setTab}
              query={{} as any}
              onQueryChange={() => undefined}
              onActorClick={() => undefined}
              onGroupClick={() => undefined}
              onEventClick={() => undefined}
              onKeywordClick={() => undefined}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    ))
  );
};

export default GroupPreview;
