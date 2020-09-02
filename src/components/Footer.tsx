import { themedUseStyletron } from "@theme/CustomeTheme"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { StyledLink } from "baseui/link"
import { ParagraphSmall, HeadingXSmall } from "baseui/typography"
import { useStaticQuery, graphql } from "gatsby"
import * as React from "react"


export const Footer: React.FC = () => {
  const [, theme] = themedUseStyletron()
  const {
    site: {
      siteMetadata: { title, githubLink },
    },
  } = useStaticQuery(graphql`
    query FooterQuery {
      site {
        siteMetadata {
          title
          githubLink
        }
      }
    }
  `)
  return (
    <FlexGridItem padding="40px" backgroundColor={theme.colors.brandPrimary}>
      <footer>
        <FlexGrid flexGridColumnCount={3}>
          <FlexGridItem>
            <HeadingXSmall>{title}</HeadingXSmall>
            </FlexGridItem>
          <FlexGridItem />
          <FlexGridItem>
            <ul>
              <li>
                <ParagraphSmall color={theme.colors.white}>
                  <StyledLink href={githubLink}>Github</StyledLink>
                </ParagraphSmall>
              </li>
            </ul>
          </FlexGridItem>
        </FlexGrid>
      </footer>
    </FlexGridItem>
  )
}
