import { authProvider, httpRestClient } from "@liexp/ui/client/api";
import {
  LinkCreate,
  LinkEdit,
  LinkList
} from "@liexp/ui/components/admin/AdminLinks";
import {
  MediaCreate,
  MediaEdit, MediaList
} from "@liexp/ui/components/admin/AdminMedia";
import {
  EventSuggestionEdit, EventSuggestionList
} from "@liexp/ui/components/admin/events/suggestions/AdminEventSuggestion";
import englishMessages from "@liexp/ui/i18n/en-US";
import { themeOptions } from "@liexp/ui/theme";
import polyglotI18nProvider from "ra-i18n-polyglot";
import * as React from "react";
import { Admin, Login, Resource } from "react-admin";

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
    </Admin>
  );
};

export default ProfilePage;
