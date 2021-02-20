import { MarkdownRenderer } from "@components/Common/MarkdownRenderer";
import ProjectFundList from "@components/lists/ProjectFundList";
import { Actor, Events } from "@io/http";
import { Grid } from "@material-ui/core";
import { formatDate } from "@utils/date";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
import EditButton from "./buttons/EditButton";

export interface ActorPageContentProps extends Actor.Actor {
  metadata: Events.EventListMap;
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  metadata,
  body,
  ...frontmatter
}) => {
  const projectFunds = metadata.ProjectTransaction;
  const arrests = metadata.Arrest;
  const protests = metadata.Protest;

  return (
    <Grid container>
      <Grid item>
        <div>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="actors" resource={frontmatter} />
          </div>
        </div>
        <h1>{frontmatter.fullName}</h1>
        {pipe(
          O.fromNullable(frontmatter.avatar),
          O.fold(
            () => <div />,
            (src) => <img src={src} width={200} height="auto" />
          )
        )}
        <div>
          <h4>Fondi ({projectFunds.length})</h4>
          <ProjectFundList
            funds={projectFunds.map((f) => ({ ...f, selected: true }))}
            onClickItem={() => {}}
          />
          {/* <ProjectFundsPieGraph funds={projectFunds} /> */}
        </div>
        <div>
          <h4>Proteste ({protests.length})</h4>
          {pipe(
            protests,
            A.map((value) => (
              <div key={value.date.toISOString()}>
                <label>{formatDate(value.date)}</label>{" "}
                <span>
                  {value.for.type === "Project" ? (
                    <span key={value.for.project.id}>
                      {value.for.project.name}
                    </span>
                  ) : (
                    <span key={value.for.type}>{value.for.type}</span>
                  )}
                </span>
              </div>
            ))
          )}
        </div>
        <div>
          <h4>Arresti ({arrests.length})</h4>
          {pipe(
            arrests,
            A.map((value) => (
              <>
                <label key={value.date.toISOString()}>
                  {formatDate(value.date)}
                </label>
                <span>
                  {value.for.map((f) => {
                    return f.type === "Project" ? (
                      <span key={f.project.id}>{f.project.name}</span>
                    ) : (
                      <span key={f.type}>{f.type}</span>
                    );
                  })}
                </span>
              </>
            ))
          )}
        </div>
        <MarkdownRenderer>{body}</MarkdownRenderer>
      </Grid>
    </Grid>
  );
};
