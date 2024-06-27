import { MainContent } from "@liexp/ui/lib/components/MainContent.js";
import { ProjectPageContent } from "@liexp/ui/lib/components/ProjectPageContent.js";
import QueriesRenderer from "@liexp/ui/lib/components/QueriesRenderer.js";
import SEO from "@liexp/ui/lib/components/SEO.js";
import { Container } from "@mui/material";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { PathRouteProps } from "react-router";

export default class ProjectTemplate extends React.PureComponent<PathRouteProps> {
  render(): JSX.Element {
    return pipe(
      O.fromNullable(this.props.id),
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
