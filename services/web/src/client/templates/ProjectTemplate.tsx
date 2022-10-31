import { MainContent } from "@liexp/ui/components/MainContent";
import { ProjectPageContent } from "@liexp/ui/components/ProjectPageContent";
import QueriesRenderer from "@liexp/ui/components/QueriesRenderer";
import SEO from "@liexp/ui/components/SEO";
import { useProjectQuery } from "@liexp/ui/state/queries/DiscreteQueries";
import { RouteComponentProps } from "@reach/router";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";

export default class ProjectTemplate extends React.PureComponent<
  RouteComponentProps<{ projectId: string }>
> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.projectId),
      O.fold(
        () => <div>Missing project id</div>,
        (projectId) => (
          <QueriesRenderer
            queries={{ project: useProjectQuery({ id: projectId }) }}
            render={({ project }) => (
              <MainContent>
                <SEO
                  title={project.name}
                  image={project.media[0]?.thumbnail ?? ""}
                  urlPath={`projects/${project.id}`}
                />
                <ProjectPageContent
                  {...project}
                  metadata={{
                    Protest: [],
                    Condemned: [],
                    Arrest: [],
                    Death: [],
                    PublicAnnouncement: [],
                    Uncategorized: [],
                    Transaction: [],
                  }}
                />
              </MainContent>
            )}
          />
        )
      )
    );
  }
}
