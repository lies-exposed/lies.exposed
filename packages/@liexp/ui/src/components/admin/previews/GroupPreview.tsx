import { http } from "@liexp/shared/io";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { QueryClient, QueryClientProvider } from "react-query";
import { ECOTheme } from "../../../theme";
import { GroupPageContent } from "../../GroupPageContent";
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

  if (!record) {
    return <LoadingIndicator />;
  }

  return pipe(
    result,
    E.fold(ValidationErrorsLayout, (p) => (
      <HelmetProvider>
        <QueryClientProvider client={qc}>
          <ThemeProvider theme={ECOTheme}>
            <GroupPageContent
              group={p}
              groupsMembers={[]}
              projects={[]}
              funds={[]}
              onMemberClick={() => undefined}
              onGroupClick={() => undefined}
              ownedGroups={[]}
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

export default GroupPreview;
