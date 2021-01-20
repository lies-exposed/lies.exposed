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
import React from "react";

export default class ProjectTemplate extends React.PureComponent<RouteComponentProps> {
  render(): JSX.Element {
    const id = this.props.location?.search ?? "not-a-real-id";

    return (
      <WithQueries
        queries={{ project: project }}
        params={{ project: { id: id } }}
        render={QR.fold(Loader, ErrorBox, ({ project }) => (
          <MainContent>
            <SEO title={project.frontmatter.name} />
            <ProjectPageContent {...project} metadata={eventMetadataMapEmpty} />
          </MainContent>
        ))}
      />
    );
  }
}
