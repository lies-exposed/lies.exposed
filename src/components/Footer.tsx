import { faSlack, faGithub } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { themedUseStyletron } from "@theme/CustomeTheme"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import { StyledLink } from "baseui/link"
import { Menu } from "baseui/menu"
import { HeadingXSmall } from "baseui/typography"
import { useStaticQuery, graphql } from "gatsby"
import * as React from "react"
import { mainMenu } from "./Header"

export const Footer: React.FC = () => {
  const [, theme] = themedUseStyletron()
  const {
    site: {
      siteMetadata: { title, github },
    },
  } = useStaticQuery(graphql`
    query FooterQuery {
      site {
        siteMetadata {
          title
          github {
            link
          }
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
          <FlexGridItem>
            <Menu
              overrides={{
                List: {
                  style: { backgroundColor: "trasparent", boxShadow: "none" },
                },
                ListItem: {
                  style: { color: theme.colors.primary },
                },
              }}
              items={mainMenu}
            />
          </FlexGridItem>
          <FlexGridItem>
            <ul style={{ listStyle: "none" }}>
              <li>
                <StyledLink href={github.link}>
                  <FontAwesomeIcon icon={faGithub} /> Github
                </StyledLink>
              </li>
              <li>
                <StyledLink>
                  <FontAwesomeIcon icon={faSlack} /> Slack
                </StyledLink>
              </li>
            </ul>
          </FlexGridItem>
        </FlexGrid>
      </footer>
    </FlexGridItem>
  )
}
