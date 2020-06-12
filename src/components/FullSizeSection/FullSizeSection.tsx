import { MainContent } from "@components/MainContent"
import { isServer } from "@utils/isServer"
import { FlexGrid, FlexGridItem } from "baseui/flex-grid"
import * as React from "react"
import { throttle } from "throttle-debounce"

interface FullSizeSectionProps {
  id: string
  backgroundcolor?: string
  'background-image'?: string
}

export const FullSizeSection: React.FC<FullSizeSectionProps> = props => {
  
  const {
    id,
    backgroundcolor: backgroundColor,
    'background-image': backgroundImage,
    children,
  } = props
  const [{ width, minHeight, maxWidth }, setPageSize] = React.useState({
    minHeight: isServer ? 800 : window.innerHeight,
    width: isServer ? "auto" : "100%",
    maxWidth: isServer ? 800 : window.innerWidth,
  })

  function updatePageSize(): void {
    setPageSize({
      minHeight: window.innerHeight,
      width: "100%",
      maxWidth: window.innerWidth,
    })
  }

  React.useEffect(() => {
    updatePageSize()

    const resizeListener = throttle(100, updatePageSize)

    window.addEventListener("resize", resizeListener)

    return () => {
      window.removeEventListener("resize", resizeListener)
    }
  }, [children?.toString()])

  return (
    <div
      id={id}
      className="full-size-section"
      style={{
        width,
        minHeight,
        maxWidth,
        backgroundColor,
        backgroundImage: backgroundImage !== undefined ? `url(${backgroundImage})`: undefined,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      }}
    >
      <MainContent>
        <FlexGrid>
          <FlexGridItem display="flex" flexDirection="column">
            {children}
          </FlexGridItem>
        </FlexGrid>
      </MainContent>
    </div>
  )
}
