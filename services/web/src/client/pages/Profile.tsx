import {
  LinkCreate,
  LinkEdit,
  LinkList,
} from "@liexp/ui/components/admin/AdminLinks";
import {
  MediaList,
  MediaCreate,
  MediaEdit,
} from "@liexp/ui/components/admin/AdminMedia";
import {
  EventSuggestionList,
  EventSuggestionEdit,
} from "@liexp/ui/components/admin/events/suggestions/AdminEventSuggestion";
import englishMessages from "@liexp/ui/i18n/en-US";
import { themeOptions } from "@liexp/ui/theme";
import polyglotI18nProvider from "ra-i18n-polyglot";
import * as React from "react";
import { Admin, Login, Resource } from "react-admin";
import { authProvider, httRestClient } from "../api";

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

const ProfilePage: React.FC = () => {
  // eslint-disable-next-line no-console

  return (
    <Admin
      dataProvider={httRestClient}
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
    </Admin>
  );
};

export default ProfilePage;
