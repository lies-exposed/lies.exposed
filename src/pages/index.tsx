import React from "react"
import FlexView from "react-flexview"
import Helmet from "react-helmet"
import { CountdownTimer } from "../components/CountdownTimer"
import { HomeSlider } from "../components/HomeSlider"
import Layout from "../components/Layout"
import SEO from "../components/SEO"
import '../scss/main.scss'

/* eslint-disable @typescript-eslint/no-var-requires */
const firstImage: string = require("../images/billy-clouse-781VLZjFR8g-unsplash.jpg")
const secondImage: string = require("../images/jordan-beltran-AxdlcxaModc-unsplash.jpg")
const thirdImage: string = require("../images/markus-spiske-ur3wTilBmjQ-unsplash.jpg")
/* eslint-enable @typescript-eslint/no-var-requires */

const slides = [
  {
    authorName: "Billy Clouse",
    imageURL: firstImage,
    info: "Bingham Canyon Mine, Salt Lake City, Utah, United States",
  },
  {
    authorName: "Jordan Beltran",
    imageURL: secondImage,
    info: "Av Pachacutec, Villa EL Salvador 15816, Peru, Villa EL Salvador",
  },
  {
    authorName: "Markus Spiske",
    imageURL: thirdImage,
    info: "Lorenzer Platz, Nuremberg, Bavaria, Germany",
  },
]

const IndexPage: React.FC = () => {
  return (
    <Layout>
      <Helmet>
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick.min.css"
        />
        <link
          rel="stylesheet"
          type="text/css"
          href="https://cdnjs.cloudflare.com/ajax/libs/slick-carousel/1.6.0/slick-theme.min.css"
        />
      </Helmet>
      <SEO title="Home" />
      <div style={{ position: "relative", textAlign: "center", color: "#fff" }}>
        <HomeSlider slides={slides} height={600} />
        <FlexView
          column
          grow
          height="100%"
          vAlignContent="center"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            textAlign: "center",
          }}
        >
          <CountdownTimer />
          <span>
            {`* Secondi che ci rimangono per poter mantenere l'innalzamento della temperatura globale entro il 1.5ºC`}
          </span>
        </FlexView>
      </div>
    </Layout>
  )
}

export default IndexPage
