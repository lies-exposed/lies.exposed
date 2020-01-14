import React from "react"
import Layout from "../components/Layout"
import SEO from "../components/SEO"
import { Columns } from "react-bulma-components"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <Columns>
      <Columns.Column>
        <img src="/images/gatsby-astronaut.png" />
      </Columns.Column>
    </Columns>
  </Layout>
)

export default IndexPage
