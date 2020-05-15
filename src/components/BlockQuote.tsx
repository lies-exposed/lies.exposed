import { themedUseStyletron } from "@theme/CustomeTheme"
import * as React from "react"

export const BlockQuote: React.FC = ({ children }) => {
  const [, $theme] = themedUseStyletron()
  return (
    <blockquote
      style={{
        backgroundColor: $theme.colors.backgroundTertiary,
        padding: 20,
        fontFamily: $theme.typography.thirdaryFont,
        fontStyle: 'italic'
      }}
    >
      {children}
    </blockquote>
  )
}
