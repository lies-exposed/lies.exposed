import { http } from "@liexp/shared/lib/io/index.js";
import { QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Schema } from "effect";
import * as E from "fp-ts/lib/Either.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { LoadingIndicator, useEditContext } from "react-admin";
import { ECOTheme } from "../../../theme/index.js";
import { FlowGraph } from "../../Common/Graph/Flow/FlowGraph.js";
import { HelmetProvider } from "../../SEO.js";
import { ValidationErrorsLayout } from "../../ValidationErrorsLayout.js";
import { ThemeProvider } from "../../mui/index.js";

const GraphRenderer: React.FC<{ graph: http.Graph.Graph }> = ({ graph }) => {
  const component = React.useMemo(() => {
    if (Schema.is(http.Graph.GraphType.members[0])(graph.type)) {
      return <FlowGraph nodes={graph.data.nodes} edges={graph.data.edges} />;
    }
    return <div>Render graph here</div>;
  }, [graph.data]);

  return component;
};

const GraphPreview: React.FC = () => {
  const { record } = useEditContext();

  const qc = useQueryClient();

  const result = React.useMemo(
    () =>
      Schema.decodeUnknownEither(http.Graph.Graph)({
        ...(record ?? {}),
      }),
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
            <React.Suspense>
              <GraphRenderer graph={p} />
            </React.Suspense>
          </QueryClientProvider>
        </ThemeProvider>
      </HelmetProvider>
    )),
  );
};

export default GraphPreview;
