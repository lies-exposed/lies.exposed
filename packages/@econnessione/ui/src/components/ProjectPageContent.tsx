import { Events, Project } from "@econnessione/shared/io/http";
import { formatDate } from "@econnessione/shared/utils/date";
import { Grid, Typography } from "@material-ui/core";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { MarkdownRenderer } from "./Common/MarkdownRenderer";
import { Slider } from "./Common/Slider/Slider";
import { ProjectAreasMap } from "./Graph/ProjectAreasMap";

export interface ProjectPageContentProps extends Project.Project {
  metadata: Events.EventListMap;
}

export const ProjectPageContent: React.FC<ProjectPageContentProps> = ({
  body,
  metadata,
  ...frontmatter
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
            {frontmatter.name}
          </Typography>
          <div>
            <label>Data di inizio {formatDate(frontmatter.startDate)}</label>
            {pipe(
              O.fromNullable(frontmatter.endDate),
              O.map((date) => (
                // eslint-disable-next-line react/jsx-key
                <label>Data di fine {formatDate(date)}</label>
              )),
              O.toNullable
            )}
          </div>
        </div>
      </Grid>

      <Grid container direction="column">
        <Grid item style={{ height: 400 }}>
          {pipe(
            O.fromNullable(frontmatter.media),
            O.map((media) => (
              <Slider
                key={`project-${frontmatter.id}-slider`}
                slides={media.map((i) => ({
                  authorName: "",
                  info: i.description ?? "",
                  src: i.location,
                  type: "image/png",
                }))}
                arrows={true}
                dots={true}
              />
            )),
            O.getOrElse(() => <div>No media!</div>)
          )}
        </Grid>
        <Grid>
          <ProjectAreasMap project={{ ...frontmatter, body }} />
          <div>
            <Typography variant="h4">Fondi: {totalFunded}</Typography>
            {/* <GroupOrActorList
              by={investors}
              onByClick={() => {}}
              avatarScale="scale1000"
            /> */}
            {/* <ProjectFundsPieGraph funds={metadata.ProjectTransaction} /> */}
          </div>
          <div>
            <Typography variant="h4">
              Proteste: {metadata.Protest.length}
            </Typography>
            {/* <GroupOrActorList
              by={protesters}
              onByClick={() => {}}
              avatarScale="scale1000"
            /> */}
          </div>
          <div>
            <Typography variant="h4">
              Arresti: {metadata.Arrest.length}
            </Typography>
            {/* <GroupOrActorList
              by={arrested}
              onByClick={() => {}}
              avatarScale="scale1000"
            /> */}
          </div>
          <div>
            <Typography variant="h4">
              Impacts: {metadata.ProjectImpact.length}
            </Typography>
            [tabella degli impatti del progetto]
          </div>
          <div>
            <h3>Indagati:</h3> [totale contributori / contributori indagati]
          </div>
        </Grid>
      </Grid>
      <Grid>
        <MarkdownRenderer>{body}</MarkdownRenderer>
      </Grid>
    </Grid>
  );
};
