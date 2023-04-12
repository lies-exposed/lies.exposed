import { Layout } from "@liexp/ui/lib/components/Layout";
import SEO from "@liexp/ui/lib/components/SEO";
import * as React from "react";

const SupportPage: React.FunctionComponent = () => (
  <Layout
    header={{
      pathname: "",
      menu: [],
      onTitleClick: () => undefined,
      onMenuItemClick: () => undefined,
    }}
  >
    <SEO title="Home" image="" urlPath='/support' />
    <div>
      <div>
        <p>In sviluppo</p>
      </div>
    </div>
  </Layout>
);

export default SupportPage;
