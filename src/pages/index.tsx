import { HomeSlider } from "@components/HomeSlider"
import { Layout } from "@components/Layout"
import { MainContent } from "@components/MainContent"
import { PageContent } from "@components/PageContent"
import SEO from "@components/SEO"
import { PageContentFileNode } from "@models/page"
import { FlexGridItem, FlexGrid } from "baseui/flex-grid"
import { useStaticQuery, graphql } from "gatsby"
import React from "react"
import Helmet from "react-helmet"

/* eslint-disable @typescript-eslint/no-var-requires */
const firstImage: string = require("../../static/media/img/billy-clouse-781VLZjFR8g-unsplash.jpg")
const secondImage: string = require("../../static/media/img/jordan-beltran-AxdlcxaModc-unsplash.jpg")
const thirdImage: string = require("../../static/media/img/markus-spiske-ur3wTilBmjQ-unsplash.jpg")
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

interface Results {
  pageContent: PageContentFileNode
}

const IndexPage: React.FC = () => {
  const { pageContent }: Results = useStaticQuery(graphql`
    query IndexPage {
      pageContent: file(
        sourceInstanceName: { eq: "pages" }
        name: { eq: "index" }
      ) {
        ...PageFileNode
      }
    }
  `)

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
      <FlexGrid width="100%" flexGridColumnCount={1}>
        <FlexGridItem position="relative">
          <div>
            <HomeSlider slides={slides} height={600} />
          </div>
        </FlexGridItem>

        <FlexGridItem paddingTop="70px">
          <MainContent>
          <PageContent {...pageContent.childMarkdownRemark} />
          </MainContent>
        </FlexGridItem>
      </FlexGrid>
    </Layout>
  )
}

export default IndexPage
