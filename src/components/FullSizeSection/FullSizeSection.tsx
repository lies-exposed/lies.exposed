import { MainContent } from "@components/MainContent"
import { isServer } from "@utils/isServer"
import * as React from "react"
import { throttle } from "throttle-debounce"

interface FullSizeSectionProps {
  id: string
  backgroundColor?: string
  backgroundImage?: string
}

export const FullSizeSection: React.FC<FullSizeSectionProps> = (props) => {
  const { id, backgroundColor, backgroundImage, children } = props
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

  const bgColor = backgroundColor ?? "transparent"

  const bgImage =
    backgroundImage !== undefined ? `url(${backgroundImage})` : undefined

  return (
    <div
      id={id}
      className="FullSizeSection"
      style={{
        width,
        minHeight,
        maxWidth,
        backgroundColor: bgColor,
        backgroundImage: bgImage,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        paddingTop: 60,
        paddingBottom: 60,
      }}
    >
      <MainContent
        style={{
          backgroundColor:
            backgroundImage !== undefined ? "rgba(255, 255, 255, 0.8)" : "trasparent",
          paddingLeft: "30px",
          paddingRight: "30px"
        }}
      >
        {children}
      </MainContent>
    </div>
  )
}
