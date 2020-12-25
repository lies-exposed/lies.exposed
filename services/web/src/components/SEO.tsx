import React from "react"
import Helmet from "react-helmet"

interface SEOProps {
  description?: string
  lang?: string
  meta?: any[]
  title: string
}

interface QueryResults {
  site: {
    siteMetadata: {
      title: string
      description: string
      author: string
    }
  }
}

const SEO: React.FC<SEOProps> = ({ description, lang, meta = [], title }) => {
  const { site }: QueryResults = {
    site: {
      siteMetadata: {
        title: 'here',
        description: 'dete',
        author: 'nobody'
      }
    }
  }

  const metaDescription = description ?? site.siteMetadata.description

  return (
    <Helmet
      htmlAttributes={
        lang !== undefined
          ? {
              lang,
            }
          : undefined
      }
      title={title}
      titleTemplate={`%s | ${site.siteMetadata.title}`}
      meta={[
        {
          name: `description`,
          content: metaDescription,
        },
        {
          property: `og:title`,
          content: title,
        },
        {
          property: `og:description`,
          content: metaDescription,
        },
        {
          property: `og:type`,
          content: `website`,
        },
        {
          name: `twitter:card`,
          content: `summary`,
        },
        {
          name: `twitter:creator`,
          content: site.siteMetadata.author,
        },
        {
          name: `twitter:title`,
          content: title,
        },
        {
          name: `twitter:description`,
          content: metaDescription,
        },
      ].concat(meta)}
    />
  )
}

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
}

export default SEO
