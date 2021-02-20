import { Card } from "@material-ui/core";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { extractEventsMetadata } from "../../helpers/event";
import { events } from "../../mock-data/events";
import { firstBadProject } from "../../mock-data/projects";
import {
  ProjectPageContent,
  ProjectPageContentProps,
} from "../ProjectPageContent";

export const projectPageContentExampleArgs: ProjectPageContentProps = {
  ...firstBadProject,
  // tableOfContents: O.none,
  // timeToRead: O.none,
  metadata: pipe(
    events,
    extractEventsMetadata({ type: "Project", elem: firstBadProject })
  ),
};

export const ProjectPageContentExample: React.FC<ProjectPageContentProps> = (
  props
) => {
  const pageContentProps = R.isEmpty(props as {})
    ? projectPageContentExampleArgs
    : props;

  return (
    <Card style={{ width: "100%" }}>
      <ProjectPageContent {...pageContentProps} />
    </Card>
  );
};
