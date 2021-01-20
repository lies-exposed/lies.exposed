import ProjectFundList from "@components/lists/ProjectFundList";
import { Actor, Events } from "@econnessione/shared/lib/io/http";
import { formatDate } from "@utils/date";
import { RenderHTML } from "@utils/renderHTML";
import { Block } from "baseui/block";
import { FlexGrid, FlexGridItem } from "baseui/flex-grid";
import { HeadingXLarge, HeadingXSmall, LabelMedium } from "baseui/typography";
import * as A from "fp-ts/lib/Array";
import * as O from "fp-ts/lib/Option";
import { pipe } from "fp-ts/lib/pipeable";
import * as React from "react";
// import { ProjectFundsPieGraph } from "./Graph/ProjectFundsPieGraph";
import EditButton from "./buttons/EditButton";

export interface ActorPageContentProps extends Actor.ActorMD {
  metadata: Events.EventListMap;
}

export const ActorPageContent: React.FC<ActorPageContentProps> = ({
  frontmatter,
  metadata,
  body,
}) => {
  const projectFunds = metadata.ProjectTransaction;
  const arrests = metadata.Arrest;
  const protests = metadata.Protest;

  return (
    <FlexGrid width="100%">
      <FlexGridItem width="100%">
        <Block overrides={{ Block: { style: { textAlign: "right" } } }}>
          <div style={{ textAlign: "right", padding: 10 }}>
            <EditButton resourceName="actors" resource={frontmatter} />
          </div>
        </Block>
        <HeadingXLarge>{frontmatter.fullName}</HeadingXLarge>
        {pipe(
          frontmatter.avatar,
          O.fold(
            () => <div />,
            (src) => <img src={src} width={200} height={400} />
          )
        )}
        <Block>
          <HeadingXSmall>Fondi ({projectFunds.length})</HeadingXSmall>
          <ProjectFundList
            funds={projectFunds.map((f) => ({ ...f, selected: true }))}
            onClickItem={() => {}}
          />
          {/* <ProjectFundsPieGraph funds={projectFunds} /> */}
        </Block>
        <Block>
          <HeadingXSmall>Proteste ({protests.length})</HeadingXSmall>
          {pipe(
            protests,
            A.map((value) => (
              <div key={value.date.toISOString()}>
                <LabelMedium display="inline">
                  {formatDate(value.date)}
                </LabelMedium>{" "}
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
        </Block>
        <Block>
          <HeadingXSmall>Arresti ({arrests.length})</HeadingXSmall>
          {pipe(
            arrests,
            A.map((value) => (
              <>
                <LabelMedium key={value.date.toISOString()} display="inline">
                  {formatDate(value.date)}
                </LabelMedium>
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
        </Block>
        <div className="content">{RenderHTML({ children: body })}</div>
      </FlexGridItem>
    </FlexGrid>
  );
};
