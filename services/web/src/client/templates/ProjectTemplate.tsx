import { eventMetadataMapEmpty } from "@liexp/shared/mock-data/events/events-metadata";
import { ErrorBox } from "@liexp/ui/components/Common/ErrorBox";
import { Loader } from "@liexp/ui/components/Common/Loader";
import { MainContent } from "@liexp/ui/components/MainContent";
import { ProjectPageContent } from "@liexp/ui/components/ProjectPageContent";
import SEO from "@liexp/ui/components/SEO";
import { Queries } from "@liexp/ui/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/function";
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
          <WithQueries
            queries={{ project: Queries.Project.get }}
            params={{ project: { id: projectId } }}
            render={QR.fold(Loader, ErrorBox, ({ project }) => (
              <MainContent>
                <SEO
                  title={project.name}
                  image={project.media[0]?.thumbnail ?? ""}
                  urlPath={`projects/${project.id}`}
                />
                <ProjectPageContent
                  {...project}
                  metadata={eventMetadataMapEmpty}
                />
              </MainContent>
            ))}
          />
        )
      )
    );
  }
}
