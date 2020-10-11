import { generateRandomColor } from "@utils/colors"
import * as React from "react"

interface ColorWidgetControlProps {
  forID: string
  classNameWrapper: string
  value: string
  onChange: (value: string) => void
}

export class ColorWidgetControl extends React.Component<
  ColorWidgetControlProps
> {
  componentDidMount(): void {
    const { value } = this.props
    const v = value !== undefined ? value : generateRandomColor()
    this.props.onChange(v)
  }

  isValid = (): boolean => {
    return /^[0-9A-F]{6}$/i.test(this.props.value)
  }

  render(): JSX.Element {
    const { value, forID, classNameWrapper, onChange } = this.props
    return (
      <div className={classNameWrapper}>
        <input
          id={forID}
          type="text"
          value={value}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
        <div
          style={{
            position: "absolute",
            right: 20,
            transform: "translateY(-24px)",
            width: "-moz-fit-content",
            zIndex: 1,
          }}
        >
          <button
            onClick={() => onChange(generateRandomColor())}
            style={{
              border: "0px none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: 500,
              padding: "0px 15px",
              backgroundColor: `#${value}`,
              color: "rgb(58, 105, 199)",
              fontSize: 13,
              height: 23,
              lineHeight: 23,
            }}
          >
            New color
          </button>
        </div>
      </div>
    )
  }
}

export const ColorWidgetPreview: React.FC<any> = (props) => {
  return <div>{props.value}</div>
}
