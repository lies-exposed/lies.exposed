import { UnsplashCredit } from "@components/UnspashCredit"
import { Block } from "baseui/block"
import * as React from "react"
import * as SlickSlider from "react-slick"
import './slider.scss'

interface Slide {
  imageURL: string
  authorName: string
  info: string
}

interface SliderProps extends SlickSlider.Settings {
  height: number
  slides: Slide[]
  size: 'contain' | 'cover'
}

export const Slider: React.FC<SliderProps> = ({
  slides,
  height,
  size,
  ...props
}) => {
  const heightAsPX = `${height}px`
  return (
    <SlickSlider.default {...props}>
      {slides.map((s) => (
        <Block
          key={s.imageURL}
          overrides={{
            Block: {
              style: {
                position: "relative",
                height: heightAsPX,
                backgroundImage: `url(${s.imageURL})`,
                backgroundPosition: "center",
                backgroundSize: size,
                backgroundRepeat: "no-repeat",
              },
            },
          }}
        >
          <div
            style={{ padding: 10, position: "absolute", right: 0, bottom: 0 }}
          >
            <UnsplashCredit authorName={s.authorName} />
          </div>
        </Block>
      ))}
    </SlickSlider.default>
  )
}
