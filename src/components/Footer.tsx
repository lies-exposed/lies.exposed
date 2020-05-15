import { themedUseStyletron } from "@theme/CustomeTheme"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { StyledLink } from "baseui/link"
import { ParagraphSmall } from "baseui/typography"
import * as React from "react"

interface FooterProps {
  githubLink: string
}

export const Footer: React.FC<FooterProps> = props => {
  const [, theme] = themedUseStyletron()
  return (
    <FlexGridItem padding="40px" backgroundColor={theme.customColors.brandPrimary}>
      <footer>
        <FlexGrid flexGridColumnCount={3}>
          <FlexGridItem />
          <FlexGridItem />
          <FlexGridItem>
            <ul>
              <li>
                <ParagraphSmall color={theme.colors.white}>
                  <StyledLink href={props.githubLink}>Github</StyledLink>
                </ParagraphSmall>
              </li>
            </ul>
          </FlexGridItem>
        </FlexGrid>
      </footer>
    </FlexGridItem>
  )
}
