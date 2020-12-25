import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import * as React from "react"

export const ErrorBox: (e: any) => React.ReactElement = (e: any) => {
  return (
    <FlexGrid>
      <FlexGridItem backgroundColor="red">
        <h4>An error occured</h4>
        <code>{JSON.stringify(e, null, 4)}</code>
      </FlexGridItem>
    </FlexGrid>
  )
}
