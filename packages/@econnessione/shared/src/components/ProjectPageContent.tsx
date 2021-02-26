import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import EditButton from "@components/buttons/EditButton";
import { Events, Project } from "@io/http";
import { Grid } from "@material-ui/core";
import { formatDate } from "@utils/date";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import { Slider } from "./Common/Slider/Slider";
import { ProjectFundsMap } from "./Graph/ProjectFundsMap";

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
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="areas" resource={frontmatter} />
          </div>
        </div>
        <div>
          <h1>{frontmatter.name}</h1>
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
      <Grid container>
        <Grid item>
          {pipe(
            O.fromNullable(frontmatter.images),
            O.map((images) => (
              <div key={`project-${frontmatter.id}`}>
                <Slider
                  key={`project-${frontmatter.id}-slider`}
                  height={400}
                  slides={images.map((i) => ({
                    authorName: "",
                    info: i.description ?? "",
                    imageURL: i.location,
                  }))}
                  arrows={true}
                  adaptiveHeight={true}
                  dots={true}
                  size="contain"
                />
              </div>
            )),
            O.toNullable
          )}
          <ProjectFundsMap project={{ ...frontmatter, body }} />
        </Grid>
        <Grid>
          <div>
            <h1>Fondi: {totalFunded}</h1>
            {/* <GroupOrActorList
              by={investors}
              onByClick={() => {}}
              avatarScale="scale1000"
            /> */}
            {/* <ProjectFundsPieGraph funds={metadata.ProjectTransaction} /> */}
          </div>
          <div>
            <h3>Proteste {metadata.Protest.length}</h3>
            {/* <GroupOrActorList
              by={protesters}
              onByClick={() => {}}
              avatarScale="scale1000"
            /> */}
          </div>
          <div>
            <h3>Arresti: {metadata.Arrest.length}</h3>
            {/* <GroupOrActorList
              by={arrested}
              onByClick={() => {}}
              avatarScale="scale1000"
            /> */}
          </div>
          <div>
            <h3>Impacts: {metadata.ProjectImpact.length}</h3>
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
