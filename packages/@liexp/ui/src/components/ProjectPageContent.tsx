import { type Events, type Project } from "@liexp/shared/lib/io/http";
import { formatDate } from "@liexp/shared/lib/utils/date.utils";
import * as O from "fp-ts/Option";
import { pipe } from "fp-ts/function";
import * as React from "react";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import { ProjectAreasMap } from "./Graph/ProjectAreasMap";
import { Grid, Typography } from "./mui";
import { MediaSlider } from "./sliders/MediaSlider";

export interface ProjectPageContentProps extends Project.Project {
  metadata: Events.EventListMap;
}

export const ProjectPageContent: React.FC<ProjectPageContentProps> = ({
  body,
  metadata,
  ...props
}) => {
  const totalFunded = 0;
  // const investors: Common.ByGroupOrActor[] = [];
  // const totalFunded = pipe(
  //   metadata.ProjectTransaction,
  //   A.reduce(0, (acc, f) => f.transaction.amount + acc)
  // );

  // const investors = pipe(
  //   metadata.ProjectTransaction,
  //   A.map((f) => f.transaction.by),
  //   A.uniq(
  //     Eq.eq.contramap(Eq.eqString, (e: Common.ByGroupOrActor) =>
  //       e.type === "Group" ? e.group.id : e.actor.id
  //     )
  //   )
  // );

  // const arrested = pipe(
  //   metadata.Arrest,
  //   A.map((a) => a.who)
  // );

  // const protesters = pipe(
  //   metadata.Protest,
  //   A.map((p) => p.organizers),
  //   A.flatten
  // );

  return (
    <Grid container>
      <Grid item>
        <div>
          <Typography variant="h1" component="h1">
            {props.name}
          </Typography>
          <div>
            <label>Data di inizio {formatDate(props.startDate)}</label>
            {pipe(
              O.fromNullable(props.endDate),
              O.map((date) => (
                // eslint-disable-next-line react/jsx-key
                <label>Data di fine {formatDate(date)}</label>
              )),
              O.toNullable,
            )}
          </div>
        </div>
      </Grid>

      <Grid container direction="column">
        <Grid item style={{ height: 400 }}>
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
            <Typography variant="h4">Fondi: {totalFunded}</Typography>
            {/* <GroupOrActorList
              by={investors}
              onByClick={() => {}}
              avatarScale="scale1000"
            /> */}
            {/* <ProjectFundsPieGraph funds={metadata.ProjectTransaction} /> */}
          </div>
        </Grid>
      </Grid>
      <Grid>
        <MarkdownRenderer>{body}</MarkdownRenderer>
      </Grid>
    </Grid>
  );
};
