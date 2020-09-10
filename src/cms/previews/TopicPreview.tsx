import TopicList from "@components/lists/TopicList"
import { TopicPageContent } from "@components/TopicPageContent"
import { TopicFrontmatter } from "@models/topic"
import { HTMLtoAST, MDtoHTML } from "@utils/markdownHTML"
import { renderValidationErrors } from "@utils/renderValidationErrors"
import * as E from "fp-ts/lib/Either"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"

export const TopicPreview: React.FC<any> = (props) => {
  const { entry } = props
  const { body, ...data } = entry.getIn(["data"]).toObject()
  const topic = {
    ...data,
    date: data.date.toISOString(),
  }

  return pipe(
    TopicFrontmatter.decode(topic),
    E.fold(renderValidationErrors, (topic) => (
      <>
        <FlexGrid>
         <FlexGridItem flexDirection="column">
            <TopicList
              topics={[{ ...topic, selected: true }]}
              onTopicClick={() => undefined}
            />
          </FlexGridItem>
        </FlexGrid>

        <TopicPageContent
          frontmatter={topic}
          htmlAst={HTMLtoAST(MDtoHTML(body))}
        />
      </>
    ))
  )
}
