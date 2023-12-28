import { MainContent } from "@liexp/ui/lib/components/MainContent";
import { ProjectPageContent } from "@liexp/ui/lib/components/ProjectPageContent";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer";
import SEO from "@liexp/ui/lib/components/SEO";
import { Container } from "@mui/material";
import { type RouteComponentProps } from "@reach/router";
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
            queries={(Q) => ({
              project: Q.Project.get.useQuery({ id: projectId }),
            })}
            render={({ project }) => (
              <Container>
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
                      Book: [],
                      Arrest: [],
                      Death: [],
                      PublicAnnouncement: [],
                      Uncategorized: [],
                      Transaction: [],
                    }}
                  />
                </MainContent>
              </Container>
            )}
          />
        ),
      ),
    );
  }
}
