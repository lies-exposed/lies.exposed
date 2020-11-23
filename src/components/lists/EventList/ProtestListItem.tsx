import { Slider } from "@components/Common/Slider/Slider"
import GroupOrActorList from "@components/lists/GroupAndActorList"
import { ProtestMD } from "@models/events/Protest"
import { formatDate } from "@utils//date"
import { renderHTML } from "@utils/renderHTML"
import { Block } from "baseui/block"
import { Card, StyledBody } from "baseui/card"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { HeadingSmall, LabelSmall } from "baseui/typography"
import * as O from "fp-ts/lib/Option"
import { pipe } from "fp-ts/lib/pipeable"
import * as React from "react"

interface ProtestListItemProps {
  item: ProtestMD
}

export const ProtestListItem: React.FC<ProtestListItemProps> = ({ item }) => {
  return (
    <div
      key={item.frontmatter.uuid}
      id={item.frontmatter.uuid}
      style={{
        marginBottom: 40,
      }}
    >
      <Card title={"Protest"}>
        <StyledBody>
          <FlexGrid flexGridColumnCount={1} flexDirection="column">

            {pipe(
              item.frontmatter.images,
              O.map((images) => (
                // eslint-disable-next-line react/jsx-key
                <FlexGridItem>
                  <Slider
                    key="home-slider"
                    height={400}
                    slides={images.map((i) => ({
                      authorName: i.author,
                      info: O.getOrElse(() => "")(i.description),
                      imageURL: i.image.publicURL,
                    }))}
                    arrows={true}
                    adaptiveHeight={true}
                    dots={true}
                    size="contain"
                  />
                </FlexGridItem>
              )),
              O.toNullable
            )}
            <FlexGridItem display="flex" flexGridItemCount={1}>
              <FlexGridItem
                display="flex"
                flexGridColumnCount={1}
                flexDirection="column"
              >
                <LabelSmall>
                  <time dateTime={formatDate(item.frontmatter.date)}>
                    {formatDate(item.frontmatter.date)}
                  </time>
                </LabelSmall>

                <Block>
                  <Block display="inline">
                    <HeadingSmall display="inline">Di </HeadingSmall>
                    <GroupOrActorList
                      by={item.frontmatter.organizers.map((g) => ({
                        ...g,
                        selected: false,
                      }))}
                      onByClick={() => {}}
                      avatarScale="scale1000"
                    />
                  </Block>
                  <Block display="inline">
                    <HeadingSmall display="inline">
                      Per <LabelSmall display="inline">{item.frontmatter.for.type}</LabelSmall>
                    </HeadingSmall>
                    <br />
                    {item.frontmatter.for.type === "Project"
                      ? item.frontmatter.for.project.name
                      : null}
                  </Block>
                </Block>
              </FlexGridItem>
            </FlexGridItem>
            <FlexGrid flexGridColumnCount={3}>
              <FlexGridItem display="flex" flexDirection="column">
                {renderHTML({ body: item.body })}
              </FlexGridItem>
            </FlexGrid>
          </FlexGrid>
        </StyledBody>
      </Card>
    </div>
  )
}
