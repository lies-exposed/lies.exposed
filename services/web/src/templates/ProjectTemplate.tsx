import { ErrorBox } from "@components/Common/ErrorBox";
import { Loader } from "@components/Common/Loader";
import { MainContent } from "@components/MainContent";
import { ProjectPageContent } from "@components/ProjectPageContent";
import SEO from "@components/SEO";
import { eventMetadataMapEmpty } from "@mock-data/events/events-metadata";
import { project } from "@providers/DataProvider";
import { RouteComponentProps } from "@reach/router";
import * as QR from "avenger/lib/QueryResult";
import { WithQueries } from "avenger/lib/react";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import React from "react";

export default class ProjectTemplate extends React.PureComponent<
  RouteComponentProps<{ projectId: string }>
> {
  render(): JSX.Element {
    // eslint-disable-next-line
    console.log(this.props);

    return pipe(
      O.fromNullable(this.props.projectId),
      O.fold(
        () => <div>Missing project id</div>,
        (projectId) => (
          <WithQueries
            queries={{ project: project }}
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
