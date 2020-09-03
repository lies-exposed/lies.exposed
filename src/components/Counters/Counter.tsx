import { themedUseStyletron } from "@theme/CustomeTheme"
import { Block } from "baseui/block"
import { ParagraphMedium, ParagraphXSmall } from "baseui/typography"
import * as React from "react"

interface CounterProps {
  message?: string
  sources: Array<{ label: string; url: string }>
  getCount: () => number
}
export const Counter: React.FC<CounterProps> = (props) => {
  const [, $theme] = themedUseStyletron()
  const [count, setCount] = React.useState(props.getCount())

  React.useEffect(() => {
    const countdownTimer = setTimeout(() => {
      setCount(props.getCount())
    }, 1000)
    return () => clearTimeout(countdownTimer)
  })

  return (
    <Block overrides={{ Block: { style:{ textAlign: "center"} }}}>
      <div
        style={{
          fontSize: $theme.typography.font1250.fontSize,
          fontWeight: $theme.typography.font850.fontWeight,
          lineHeight: 1.2,
          fontFamily: $theme.typography.thirdaryFont,
          color: $theme.colors.brandPrimary
        }}
      >
        {count.toLocaleString()}
        {props.message !== undefined ? "*" : ""}
      </div>
      {props.message !== undefined ? (
        <ParagraphMedium
          $style={{
            fontFamily: $theme.typography.thirdaryFont,
            color: $theme.colors.secondaryBlack
          }}
        >{`* ${props.message}`}</ParagraphMedium>
      ) : null}
      <ParagraphXSmall $style={{ fontFamily: $theme.typography.thirdaryFont }}>
        {props.sources.map((s) => (
          <a key={s.label} href={s.url}>{s.label}</a>
        ))}
      </ParagraphXSmall>
    </Block>
  )
}
