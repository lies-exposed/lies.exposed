import React from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";

export const defaultImage = `${process.env.VITE_PUBLIC_URL}/liexp-logo-1200x630.png`;

interface SEOProps {
  description?: string;
  lang?: string;
  meta?: any[];
  title: string;
  image?: string;
  urlPath: string;
}

interface QueryResults {
  site: {
    siteMetadata: {
      title: string;
      description: string;
      author: string;
    };
  };
}

const SEO: React.FC<SEOProps> = ({
  description,
  lang,
  meta = [],
  title,
  image = defaultImage,
  urlPath,
}) => {
  const { site }: QueryResults = {
    site: {
      siteMetadata: {
        title: "Lies Exposed",
        description:
          "A chronological exposure of lies perpetrated against humanity.",
        author: "lies.exposed",
      },
    },
  };

  const metaDescription = description ?? site.siteMetadata.description;

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
          property: "og:url",
          content: `${process.env.VITE_PUBLIC_URL}${urlPath}`,
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
          content: `article`,
        },
        {
          property: "og:image",
          content: image,
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
  );
};

SEO.defaultProps = {
  lang: `en`,
  meta: [],
  description: ``,
};

export default SEO;

export { Helmet, HelmetProvider };
