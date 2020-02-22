import { useStyletron } from "baseui"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { StyledLink } from "baseui/link"
import { ParagraphSmall } from "baseui/typography"
import * as React from "react"

interface FooterProps {
  githubLink: string
}

export const Footer: React.FC<FooterProps> = props => {
  const [, theme] = useStyletron()
  return (
    <FlexGridItem
      padding="40px"
      backgroundColor={theme.colors.positive400}
    >
      <footer>
        <FlexGrid flexGridColumnCount={3}>
          <FlexGridItem />
          <FlexGridItem />
          <FlexGridItem>
            <ParagraphSmall color={theme.colors.white}>
              <ul>
                <li>
                  <StyledLink href={props.githubLink}>Github</StyledLink>
                </li>
              </ul>
            </ParagraphSmall>
          </FlexGridItem>
        </FlexGrid>
      </footer>
    </FlexGridItem>
  )
}
