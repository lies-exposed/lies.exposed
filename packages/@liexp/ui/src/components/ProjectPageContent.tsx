import { type Events, type Project } from "@liexp/shared/lib/io/http/index.js";
import { formatDate } from "@liexp/shared/lib/utils/date.utils.js";
import * as O from "fp-ts/lib/Option.js";
import { pipe } from "fp-ts/lib/function.js";
import * as React from "react";
import { MarkdownRenderer } from "./Common/MarkdownRenderer.js";
import { ProjectAreasMap } from "./Graph/ProjectAreasMap.js";
import { Grid, Typography } from "./mui/index.js";
import { MediaSlider } from "./sliders/MediaSlider.js";

export interface ProjectPageContentProps extends Project.Project {
  metadata: Events.EventListMap;
}

export const ProjectPageContent: React.FC<ProjectPageContentProps> = ({
  body,
  metadata: _metadata,
  ...props
}) => {
  const totalFunded = 0;

  return (
    <Grid container>
      <Grid>
        <div>
          <Typography variant="h1" component="h1">
            {props.name}
          </Typography>
          <div>
            <label>Data di inizio {formatDate(props.startDate)}</label>
            {pipe(
              O.fromNullable(props.endDate),
              O.map((date) => <label>Data di fine {formatDate(date)}</label>),
              O.toNullable,
            )}
          </div>
        </div>
      </Grid>

      <Grid container direction="column">
        <Grid style={{ height: 400 }}>
          {pipe(
            O.fromNullable(props.media),
            O.map((media) => (
              <MediaSlider
                key={`project-${props.id}-slider`}
                data={media}
                arrows={true}
                dots={true}
              />
            )),
            O.getOrElse(() => <div>No media!</div>),
          )}
        </Grid>
        <Grid>
          <ProjectAreasMap project={{ ...props, body }} />
          <div>
            <Typography variant="h4">Funds: {totalFunded}</Typography>
          </div>
        </Grid>
      </Grid>
      <Grid>
        <MarkdownRenderer>{body}</MarkdownRenderer>
      </Grid>
    </Grid>
  );
};
