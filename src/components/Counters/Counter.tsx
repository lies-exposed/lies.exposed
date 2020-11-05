import { themedUseStyletron } from "@theme/CustomeTheme"
import { Block } from "baseui/block"
import { DisplayMedium, ParagraphXSmall } from "baseui/typography"
import * as React from "react"

interface CounterProps {
  message?: string
  sources: Array<{ label: string; url: string }>
  getCount: () => number | string
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
    <Block overrides={{ Block: { style: { textAlign: "center" } } }}>
      <DisplayMedium
        overrides={{
          Block: {
            style: {
              fontFamily: $theme.typography.thirdaryFont,
              color: $theme.colors.brandPrimary,
              fontWeight: $theme.typography.font550.fontWeight
            }
          }
        }}
      >
        {count.toLocaleString()}
        <span
          style={{
            verticalAlign: "top",
            fontSize: $theme.typography.font550.fontSize,
            lineHeight: $theme.typography.font550.lineHeight,
          }}
        >
          {props.message !== undefined ? "*" : ""}
        </span>
      </DisplayMedium>
      {props.message !== undefined ? (
        <ParagraphXSmall
          $style={{
            fontFamily: $theme.typography.thirdaryFont,
            color: $theme.colors.secondaryBlack,
          }}
        >{`* ${props.message}`}</ParagraphXSmall>
      ) : null}
      <ParagraphXSmall $style={{ fontFamily: $theme.typography.thirdaryFont }}>
        {props.sources.map((s) => (
          <a key={s.label} href={s.url}>
            {s.label}
          </a>
        ))}
      </ParagraphXSmall>
    </Block>
  )
}
