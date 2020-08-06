import * as React from "react"
import { v1 as uuidv1, validate as validateUUID } from "uuid"

interface UUIDWidgetControlProps {
  forID: string
  classNameWrapper: string
  value: string
  onChange: (value: string) => void
}

export class UUIDWidgetControl extends React.Component<UUIDWidgetControlProps> {
  componentDidMount(): void {
    const { value } = this.props
    const v = value !== undefined ? value : uuidv1()
    this.props.onChange(v)
  }

  isValid = (): boolean => {
    return validateUUID(this.props.value)
  }

  render(): JSX.Element {
    const { value, forID, classNameWrapper } = this.props
    return (
      <input
        id={forID}
        className={classNameWrapper}
        type="text"
        disabled={false}
        value={value}
        style={{ cursor: "pointer" }}
      />
    )
  }
}

export const UUIDWidgetPreview: React.FC<any> = (props) => {
  return <div>{props.value}</div>
}
