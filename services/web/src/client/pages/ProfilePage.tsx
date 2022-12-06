import "@react-page/editor/lib/index.css";
import "@react-page/plugins-background/lib/index.css";
import "@react-page/plugins-divider/lib/index.css";
import "@react-page/plugins-html5-video/lib/index.css";
import "@react-page/plugins-image/lib/index.css";
import "@react-page/plugins-slate/lib/index.css";
import "@react-page/plugins-spacer/lib/index.css";
import "@react-page/plugins-video/lib/index.css";

import { authProvider, httpRestClient } from "@liexp/ui/client/api";
import { Admin, Login, Resource } from "@liexp/ui/components/admin";
import {
  ArticleCreate,
  ArticleEdit,
  ArticleList,
} from "@liexp/ui/components/admin/AdminArticles";
import {
  LinkCreate,
  LinkEdit,
  LinkList,
} from "@liexp/ui/components/admin/AdminLinks";
import {
  MediaCreate,
  MediaEdit,
  MediaList,
} from "@liexp/ui/components/admin/AdminMedia";
import {
  EventSuggestionEdit,
  EventSuggestionList,
} from "@liexp/ui/components/admin/events/suggestions/AdminEventSuggestion";
import englishMessages from "@liexp/ui/i18n/en-US";
import { themeOptions } from "@liexp/ui/theme";
import polyglotI18nProvider from "ra-i18n-polyglot";
import * as React from "react";

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

const ProfilePage: React.FC = () => {
  // eslint-disable-next-line no-console

  return (
    <Admin
      dataProvider={httpRestClient}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      loginPage={Login}
      theme={themeOptions}
      requireAuth
      basename="/profile"
    >
      <Resource
        name="links"
        list={LinkList}
        create={LinkCreate}
        edit={LinkEdit}
      />
      <Resource
        name="media"
        list={MediaList}
        create={MediaCreate}
        edit={MediaEdit}
      />
      <Resource
        name="events/suggestions"
        edit={EventSuggestionEdit}
        list={EventSuggestionList}
        create={EventSuggestionEdit}
        // icon={PostAddIcon}
      />
      <Resource
        name="articles"
        list={ArticleList}
        edit={ArticleEdit}
        create={ArticleCreate}
      />
    </Admin>
  );
};

export default ProfilePage;
