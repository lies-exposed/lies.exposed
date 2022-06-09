import { extractEventsMetadata } from "@liexp/shared/helpers/event";
import { events } from "@liexp/shared/mock-data/events";
import { firstBadProject } from "@liexp/shared/mock-data/projects";
import * as R from "fp-ts/lib/Record";
import { pipe } from "fp-ts/lib/function";
import * as React from "react";
import {
  ProjectPageContent,
  ProjectPageContentProps,
} from "../ProjectPageContent";
import { Card } from "../mui";

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
