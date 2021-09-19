import { eventMetadataMapEmpty } from "@econnessione/shared/mock-data/events/events-metadata";
import { ErrorBox } from "@econnessione/ui/components/Common/ErrorBox";
import { Loader } from "@econnessione/ui/components/Common/Loader";
import { MainContent } from "@econnessione/ui/components/MainContent";
import { ProjectPageContent } from "@econnessione/ui/components/ProjectPageContent";
import SEO from "@econnessione/ui/components/SEO";
import { Queries } from "@econnessione/ui/providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
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
                <SEO title={project.name} />
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
