import { useStyletron } from "baseui"
import * as React from "react"

export const BlockQuote: React.FC = ({ children }) => {
  const [, theme] = useStyletron()
  return (
    <blockquote style={{ backgroundColor: theme.colors.backgroundTertiary, padding: 20, fontStyle: 'italic' }}>
      {children}
    </blockquote>
  )
}
