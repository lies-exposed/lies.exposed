import "@liexp/ui/assets/react-page.css";
import { apiProvider, authProvider } from "@liexp/ui/lib/client/api";
import { FAIcon } from "@liexp/ui/lib/components/Common/Icons/FAIcon";
import {
  EventSuggestionEdit,
  EventSuggestionList,
} from "@liexp/ui/lib/components/admin/events/suggestions/AdminEventSuggestion";
import {
  LinkCreate,
  LinkList,
} from "@liexp/ui/lib/components/admin/links/AdminLinks";
import { LinkEdit } from "@liexp/ui/lib/components/admin/links/LinkEdit";
import {
  MediaCreate,
  MediaEdit,
  MediaList,
} from "@liexp/ui/lib/components/admin/media";
import {
  Admin,
  Login,
  Resource,
} from "@liexp/ui/lib/components/admin/react-admin";
import {
  StoryCreate,
  StoryEdit,
  StoryList,
} from "@liexp/ui/lib/components/admin/stories/AdminStories";
import { SignIn } from "@liexp/ui/lib/components/admin/user/SignIn";
import englishMessages from "@liexp/ui/lib/i18n/en-US";
import { themeOptions } from "@liexp/ui/lib/theme";
import polyglotI18nProvider from "ra-i18n-polyglot";
import * as React from "react";

const i18nProvider = polyglotI18nProvider(() => englishMessages, "en");

const ProfilePage: React.FC = () => {
  // eslint-disable-next-line no-console

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
    </Admin>
  );
};

export default ProfilePage;
