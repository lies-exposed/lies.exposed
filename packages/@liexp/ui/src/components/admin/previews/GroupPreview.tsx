import { http } from "@liexp/shared/lib/io/index.js";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { GroupTemplate } from "../../../templates/GroupTemplate.js";
import { ECOTheme } from "../../../theme/index.js";
import { HelmetProvider } from "../../SEO.js";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout.js";
import { ThemeProvider } from "../../mui/index.js";

const GroupPreview: React.FC = () => {
  const { record } = useEditContext();
  const qc = useQueryClient();

  const result = React.useMemo(
    () =>
      http.Group.Group.decode({
        ...(record ?? {}),
      }),
    [record],
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
              query={{ hash: "group-preview" }}
              onQueryChange={() => undefined}
              onActorClick={() => undefined}
              onGroupClick={() => undefined}
              onEventClick={() => undefined}
              onKeywordClick={() => undefined}
            />
          </ThemeProvider>
        </QueryClientProvider>
      </HelmetProvider>
    )),
  );
};

export default GroupPreview;
