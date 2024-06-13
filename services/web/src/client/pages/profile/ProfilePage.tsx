import { GetAuthProvider } from "@liexp/ui/lib/client/api";
import {
  FAIcon,
  UserIcon,
} from "@liexp/ui/lib/components/Common/Icons/FAIcon.js";
import {
  EventSuggestionEdit,
  EventSuggestionList,
} from "@liexp/ui/lib/components/admin/events/suggestions/AdminEventSuggestion.js";
import {
  LinkCreate,
  LinkList,
} from "@liexp/ui/lib/components/admin/links/AdminLinks.js";
import { LinkEdit } from "@liexp/ui/lib/components/admin/links/LinkEdit.js";
import {
  MediaCreate,
  MediaEdit,
  MediaList,
} from "@liexp/ui/lib/components/admin/media/index.js";
import {
  Admin,
  Login,
  Resource,
} from "@liexp/ui/lib/components/admin/react-admin.js";
import {
  StoryCreate,
  StoryEdit,
  StoryList,
} from "@liexp/ui/lib/components/admin/stories/AdminStories.js";
import { SignIn } from "@liexp/ui/lib/components/admin/user/SignIn.js";
import { useDataProvider } from "@liexp/ui/lib/hooks/useDataProvider.js";
import englishMessages from "@liexp/ui/lib/i18n/en-US.js";
import { themeOptions } from "@liexp/ui/lib/theme/index.js";
import polyglotI18nProvider from "ra-i18n-polyglot";
import * as React from "react";
import { Route } from "react-router-dom";
import { UserEditMe } from "./UserEditMe.js";
import { UserListMe } from "./UserListMe.js";

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

const ProfilePage: React.FC = () => {
  // eslint-disable-next-line no-console
  const apiProvider = useDataProvider();
  const authProvider = GetAuthProvider(apiProvider);

  return (
    <Admin
      dataProvider={apiProvider}
      authProvider={authProvider}
      i18nProvider={i18nProvider}
      loginPage={
        <Login>
          <SignIn redirectTo={"/profile"} />
        </Login>
      }
      theme={themeOptions as any}
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
        name="stories"
        list={StoryList}
        edit={StoryEdit}
        create={StoryCreate}
        icon={() => <FAIcon icon="quote-left" />}
      />

      <Resource name="users" list={<UserListMe />} icon={UserIcon}>
        <Route path="me" element={<UserEditMe />} />
      </Resource>
    </Admin>
  );
};

export default ProfilePage;
