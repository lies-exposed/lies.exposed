import { ProjectMD } from "@models/Project"
import { FundFrontmatter } from "@models/events/Fund"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { HeadingXLarge } from "baseui/typography"
import * as React from "react"
import { ProjectFundsMap } from "./Graph/ProjectFundsMap"
import EditButton from "./buttons/EditButton"

interface ProjectPageContentProps extends ProjectMD {
  funds: FundFrontmatter[]
}

export const ProjectPageContent: React.FC<ProjectPageContentProps> = ({
  frontmatter,
  body,
  funds,
}) => {

  return (
    <>
      <Block
        overrides={{ Block: { style: { textAlign: "right", margin: 10 } } }}
      >
        <div style={{ textAlign: "right", padding: 10 }}>
          <EditButton resourceName="areas" resource={frontmatter} />
        </div>
      </Block>
      <HeadingXLarge>{frontmatter.name}</HeadingXLarge>
      <ProjectFundsMap project={frontmatter} funds={funds}  />
      <div className="content">{renderHTML({ body })}</div>
    </>
  )
}
